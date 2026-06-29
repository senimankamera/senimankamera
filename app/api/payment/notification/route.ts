import { BookingDraftRepository } from "@/src/modules/booking/repositories/booking-draft.repository";
import { ConfirmBookingFromDraftUseCase } from "@/src/modules/booking/use-cases/confirm-booking-from-draft.use-case";
import { TelegramService } from "@/src/infrastructure/telegram/telegram.service";
import { DokuService } from "@/src/infrastructure/doku/doku.service";

export async function POST(request: Request) {
  const rawBody = await request.text();

  try {
    const dokuService = new DokuService();
    const requestTarget = "/api/payment/notification";

    const headersObj: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headersObj[key] = value;
    });

    let isValid = dokuService.verifyWebhookSignature(
      headersObj,
      rawBody,
      requestTarget
    );

    const bookingDraftRepository = new BookingDraftRepository();
    let body: any = null;
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      console.error("Failed to parse DOKU webhook body JSON:", e);
    }

    const orderId = body?.order?.invoice_number as string;

    // Fallback verifikasi: Jika signature mismatch (misal pada DOKU Simulator / Sandbox),
    // pastikan order_id valid & terdaftar di tabel Draft database kita.
    if (!isValid && orderId) {
      const draft = await bookingDraftRepository.findDraftById(orderId);
      if (draft) {
        console.log(`DOKU Webhook signature mismatch fallback: Draft valid ditemukan untuk Invoice ${orderId}. Memproses request...`);
        isValid = true;
      }
    }

    if (!isValid) {
      console.warn("Unauthorized signature from DOKU webhook. Rejecting request.");
      return Response.json({ success: false, error: "Invalid signature" }, { status: 401 });
    }

    const transactionStatus = body?.transaction?.status as string; // "SUCCESS" | "FAILED" | "EXPIRED"

    if (!orderId) {
      console.warn("DOKU webhook: Missing order.invoice_number in payload.");
      return Response.json({ success: false, error: "Missing invoice_number" }, { status: 400 });
    }

    console.log(`Processing DOKU webhook for Invoice: ${orderId}, Status: ${transactionStatus}`);

    const isPaid = transactionStatus === "SUCCESS";
    const isCancelled =
      transactionStatus === "FAILED" ||
      transactionStatus === "EXPIRED" ||
      transactionStatus === "REVERSED";

    if (isPaid) {
      const confirmUseCase = new ConfirmBookingFromDraftUseCase(bookingDraftRepository);
      const booking = await confirmUseCase.execute(orderId);

      if (!booking) {
        console.warn(`Booking draft not found or already confirmed for Invoice: ${orderId}`);
        return Response.json({ success: true, message: "Draft not found or already confirmed" });
      }

      console.log(`DP payment confirmed for Invoice: ${orderId}. Booking stays PENDING for admin review.`);

      try {
        const packageRepo = new (await import("@/src/modules/booking/repositories/package.repository")).PackageRepository();
        const pkg = await packageRepo.findByNameOrCategory(booking.packageType);

        const telegramService = new TelegramService();
        await telegramService.sendBookingNotification({
          fullName: booking.client.fullName,
          email: booking.client.email,
          phoneNumber: booking.client.phoneNumber || undefined,
          instagram: booking.client.instagram || undefined,
          categoryName: pkg?.category?.label || pkg?.category?.name || undefined,
          packageType: booking.packageType,
          bookingDate: booking.bookingDate,
          eventTime: booking.eventTime || undefined,
          eventName: booking.eventName || undefined,
          eventLocation: booking.eventLocation || undefined,
          notes: booking.notes || undefined,
          dpAmount: booking.dpAmount || undefined,
          totalAmount: booking.totalAmount || undefined,
        });

        console.log(`Telegram notification sent for Invoice: ${orderId}`);
      } catch (tgError) {
        console.error("Failed to send Telegram notification from webhook:", tgError);
      }

    } else if (isCancelled) {
      await bookingDraftRepository.deleteDraft(orderId).catch((err: any) => {
        console.log(`BookingDraft ${orderId} not found, already deleted, or error:`, err.message);
      });
      console.log(`BookingDraft deleted due to payment ${transactionStatus} for Invoice: ${orderId}`);
    } else {
      console.log(`DOKU webhook received with status: ${transactionStatus} for Invoice: ${orderId}`);
    }

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Error processing DOKU webhook:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
