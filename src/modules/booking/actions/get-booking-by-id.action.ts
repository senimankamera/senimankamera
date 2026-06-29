"use server";

import { BookingRepository } from "../repositories/booking.repository";
import { BookingDraftRepository } from "../repositories/booking-draft.repository";
import { ConfirmBookingFromDraftUseCase } from "../use-cases/confirm-booking-from-draft.use-case";

export async function getBookingByIdAction(id: string) {
  try {
    const repository = new BookingRepository();
    let booking = await repository.findBookingById(id);

    if (!booking) {
      // Check if it exists in BookingDraft
      const draftRepo = new BookingDraftRepository();
      const draft = await draftRepo.findDraftById(id);

      if (draft) {
        // Confirm booking from draft as instant fallback
        const confirmUseCase = new ConfirmBookingFromDraftUseCase(draftRepo);
        booking = await confirmUseCase.execute(id);

        if (booking) {
          // Send Telegram notification
          try {
            const { PackageRepository } = await import("../repositories/package.repository");
            const packageRepo = new PackageRepository();
            const pkg = await packageRepo.findByNameOrCategory(booking.packageType);
            const { TelegramService } = await import("@/src/infrastructure/telegram/telegram.service");
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
          } catch (e) {
            console.error("Failed to send Telegram notification in success view fallback:", e);
          }
        }
      }
    }

    if (!booking) {
      return {
        success: false,
        error: "Booking tidak ditemukan.",
      };
    }

    // Fetch package details to get the category label
    let categoryName = "";
    try {
      const { PackageRepository } = await import("../repositories/package.repository");
      const packageRepo = new PackageRepository();
      const pkg = await packageRepo.findByNameOrCategory(booking.packageType);
      categoryName = pkg?.category?.label || pkg?.category?.name || "";
    } catch (e) {
      console.error("Failed to fetch category name for booking success view:", e);
    }

    // Convert Prisma model to a plain JS object (sanitize dates, etc.)
    const bookingJson = JSON.parse(JSON.stringify(booking));
    bookingJson.categoryName = categoryName;

    return {
      success: true,
      data: bookingJson,
    };
  } catch (error: any) {
    console.error("getBookingByIdAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan server.",
    };
  }
}
