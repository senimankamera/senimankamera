"use server";

import { BookingRepository } from "../repositories/booking.repository";
import { CalendarRepository } from "@/src/modules/calendar/repositories/calendar.repository";
import { RescheduleBookingUseCase } from "../use-cases/reschedule-booking.use-case";
import { revalidatePath } from "next/cache";

export async function rescheduleBookingAction(id: string, newDateStr: string, sessionStartTime?: string) {
  try {
    const bookingRepository = new BookingRepository();
    const calendarRepository = new CalendarRepository();
    const useCase = new RescheduleBookingUseCase(bookingRepository, calendarRepository);

    const newDate = new Date(newDateStr);
    const result = await useCase.execute(id, newDate, sessionStartTime);

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/calendar");

    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    console.error("rescheduleBookingAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal menjadwal ulang booking." };
  }
}
