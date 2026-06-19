import crypto from "crypto";
import { BookingRepository } from "@/src/modules/booking/repositories/booking.repository";
import { TelegramService } from "@/src/infrastructure/telegram/telegram.service";
import { prisma } from "@/src/infrastructure/prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    // Verify signature key
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const signatureSource = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const expectedSignature = crypto
      .createHash("sha512")
      .update(signatureSource)
      .digest("hex");

    if (signature_key !== expectedSignature) {
      console.warn("Unauthorized signature from Midtrans webhook:", signature_key);
      return Response.json({ success: false, error: "Invalid signature" }, { status: 401 });
    }

    console.log(`Processing Midtrans webhook for Order ID: ${order_id}, Status: ${transaction_status}`);

    const bookingRepository = new BookingRepository();

    const isPaid =
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept");

    const isCancelled =
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire";

    if (isPaid) {
      // Fetch booking with client & package info for Telegram notification
      const booking = await bookingRepository.findBookingById(order_id);
      if (!booking) {
        console.error(`Booking not found for Order ID: ${order_id}`);
        return Response.json({ success: false, error: "Booking not found" }, { status: 404 });
      }

      // Record DP payment transaction (idempotent via upsert)
      const dpAmount = booking.dpAmount ?? (booking.totalAmount ?? 0) * 0.2;
      await prisma.paymentTransaction.upsert({
        where: { uniqueKey: `${booking.id}-DP` },
        update: {},
        create: {
          bookingId: booking.id,
          type: "DP",
          amount: dpAmount,
          uniqueKey: `${booking.id}-DP`,
        },
      });

      // Update paymentStatus to PAID (but booking status stays PENDING for admin review)
      await prisma.booking.update({
        where: { id: booking.id },
        data: { paymentStatus: "PAID" },
      });

      console.log(`DP payment recorded for Order ID: ${order_id}. Booking stays PENDING for admin review.`);

      // Get package category for Telegram message
      const packageRepo = new (await import("@/src/modules/booking/repositories/package.repository")).PackageRepository();
      const pkg = await packageRepo.findByNameOrCategory(booking.packageType);

      // Send Telegram notification to admin
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

      console.log(`Telegram notification sent for Order ID: ${order_id}`);

    } else if (isCancelled) {
      // Payment cancelled/expired — update paymentStatus only, keep booking for admin to review
      await prisma.booking.update({
        where: { id: order_id },
        data: { paymentStatus: "CANCELLED" },
      }).catch(() => {
        console.log(`Booking ${order_id} not found or already cancelled.`);
      });
      console.log(`Payment cancelled/denied/expired for Order ID: ${order_id}`);
    } else if (transaction_status === "pending") {
      console.log(`Payment pending for Order ID: ${order_id}`);
    }

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Error processing Midtrans webhook:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
