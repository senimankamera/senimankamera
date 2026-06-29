"use server";

import { BookingRepository } from "../repositories/booking.repository";
import { BookingTrackingSchema, BookingTrackingInput } from "../schemas/booking-tracking.schema";

export async function getBookingByTrackingAction(input: BookingTrackingInput) {
  try {
    const validated = BookingTrackingSchema.parse(input);

    const repository = new BookingRepository();
    const booking = await repository.findBookingById(validated.bookingId);

    if (!booking) {
      return {
        success: false,
        error: "Pesanan dengan Kode Tracking tersebut tidak ditemukan.",
      };
    }

    // Security check: Verify email matches client email
    if (booking.client.email.toLowerCase().trim() !== validated.email.toLowerCase().trim()) {
      return {
        success: false,
        error: "Kombinasi Kode Tracking dan Email tidak cocok.",
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
      console.error("Failed to fetch category name for tracking:", e);
    }

    const bookingJson = JSON.parse(JSON.stringify(booking));
    bookingJson.categoryName = categoryName;

    return {
      success: true,
      data: bookingJson,
    };
  } catch (error: any) {
    console.error("getBookingByTrackingAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan server.",
    };
  }
}
