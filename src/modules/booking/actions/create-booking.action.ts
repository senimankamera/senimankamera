"use server";

import { BookingRepository } from "../repositories/booking.repository";
import { CreateBookingUseCase } from "../use-cases/create-booking.use-case";
import { CreateBookingInputType } from "../schemas/create-booking.schema";
import { revalidatePath } from "next/cache";
import { TelegramService } from "@/src/infrastructure/telegram/telegram.service";

export async function createBookingAction(input: CreateBookingInputType) {
  try {
    const repository = new BookingRepository();
    const useCase = new CreateBookingUseCase(repository);
    const booking = await useCase.execute(input);

    // Send Telegram Notification
    try {
      const telegramService = new TelegramService();
      await telegramService.sendBookingNotification({
        fullName: input.fullName,
        email: input.email,
        phoneNumber: input.phoneNumber || undefined,
        packageType: input.packageType,
        bookingDate: new Date(input.bookingDate),
        notes: input.notes || undefined,
      });
    } catch (telegramError) {
      console.error("Failed to send booking telegram notification:", telegramError);
    }

    // Revalidate the admin dashboard to reflect new entries immediately
    revalidatePath("/admin");

    return {
      success: true,
      data: {
        id: booking.id,
      },
    };
  } catch (error: any) {
    console.error("createBookingAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan server.",
    };
  }
}
