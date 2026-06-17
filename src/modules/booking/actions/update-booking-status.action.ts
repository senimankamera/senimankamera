"use server";

import { BookingRepository } from "../repositories/booking.repository";
import { CalendarRepository } from "@/src/modules/calendar/repositories/calendar.repository";
import { UpdateBookingStatusUseCase } from "../use-cases/update-booking-status.use-case";
import { revalidatePath } from "next/cache";

export async function updateBookingStatusAction(id: string, status: string) {
  try {
    const bookingRepository = new BookingRepository();
    const calendarRepository = new CalendarRepository();
    const useCase = new UpdateBookingStatusUseCase(bookingRepository, calendarRepository);

    const result = await useCase.execute(id, status);

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/calendar");
    revalidatePath("/admin/recap");

    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    console.error("updateBookingStatusAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal memperbarui status booking." };
  }
}
