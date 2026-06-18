"use server";

import { BookingRepository } from "../repositories/booking.repository";
import { GetTimeSlotsUseCase } from "../use-cases/get-time-slots.use-case";

export async function getTimeSlotsAction(dateStr: string) {
  try {
    const bookingRepo = new BookingRepository();
    const useCase = new GetTimeSlotsUseCase(bookingRepo);
    const result = await useCase.execute(dateStr);

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("getTimeSlotsAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan server.",
      data: { isBlocked: false, slots: [] },
    };
  }
}
