"use server";

import { BookingRepository } from "../repositories/booking.repository";
import { revalidatePath } from "next/cache";

export async function cancelPendingBookingAction(bookingId: string) {
  try {
    if (!bookingId) {
      throw new Error("ID Booking tidak valid.");
    }
    const repository = new BookingRepository();
    const result = await repository.deletePendingBooking(bookingId);
    
    // Revalidate paths to refresh availability state
    revalidatePath("/admin");
    revalidatePath("/book");

    return {
      success: true,
      count: result.count,
    };
  } catch (error: any) {
    console.error("cancelPendingBookingAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan server.",
    };
  }
}
