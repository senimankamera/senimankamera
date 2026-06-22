"use server";

import { BookingRepository } from "../repositories/booking.repository";
import { revalidatePath } from "next/cache";

export async function deleteBookingAction(id: string) {
  try {
    const bookingRepository = new BookingRepository();
    const result = await bookingRepository.deleteBooking(id);

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/history");
    revalidatePath("/admin/recap");

    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: unknown) {
    console.error("deleteBookingAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal menghapus riwayat pesanan." };
  }
}

export async function deleteMultipleBookingsAction(ids: string[]) {
  try {
    const bookingRepository = new BookingRepository();
    const result = await bookingRepository.deleteMultipleBookings(ids);

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/history");
    revalidatePath("/admin/recap");

    return { success: true, count: result.count };
  } catch (error: unknown) {
    console.error("deleteMultipleBookingsAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal menghapus beberapa riwayat pesanan." };
  }
}
