"use server";

import { BookingDraftRepository } from "../repositories/booking-draft.repository";
import { ConfirmBookingFromDraftUseCase } from "../use-cases/confirm-booking-from-draft.use-case";
import { PackageRepository } from "../repositories/package.repository";
import { TelegramService } from "@/src/infrastructure/telegram/telegram.service";

export async function simulateDevPaymentAction(orderId: string) {
  if (process.env.NODE_ENV === "production") {
    return { success: false, error: "Tindakan ini tidak diizinkan di lingkungan produksi." };
  }

  try {
    const draftRepo = new BookingDraftRepository();
    const draft = await draftRepo.findDraftById(orderId);

    if (!draft) {
      return { success: false, error: "Draft booking tidak ditemukan." };
    }

    const confirmUseCase = new ConfirmBookingFromDraftUseCase(draftRepo);
    const booking = await confirmUseCase.execute(orderId);

    if (!booking) {
      return { success: false, error: "Gagal mengonfirmasi booking dari draft." };
    }

    // Kirim notifikasi Telegram di lingkungan dev saat simulasi berhasil
    try {
      const packageRepo = new PackageRepository();
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
    } catch (e) {
      console.error("Simulate dev payment Telegram notification error:", e);
    }

    return { success: true, booking };
  } catch (error: any) {
    console.error("simulateDevPaymentAction error:", error);
    return { success: false, error: error.message || "Terjadi kesalahan saat simulasi." };
  }
}
