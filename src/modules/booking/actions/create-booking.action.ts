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


    // Revalidate the admin dashboard to reflect new entries immediately
    revalidatePath("/admin");

    return {
      success: true,
      data: {
        id: booking.id,
        snapToken: booking.snapToken,
        snapUrl: booking.snapUrl,
        dpAmount: booking.dpAmount,
        totalAmount: booking.totalAmount,
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
