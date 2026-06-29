"use server";

import { BookingRepository } from "../repositories/booking.repository";
import { BookingDraftRepository } from "../repositories/booking-draft.repository";

export async function getBookingByIdAction(id: string) {
  try {
    const repository = new BookingRepository();
    const booking = await repository.findBookingById(id);

    if (!booking) {
      const draftRepo = new BookingDraftRepository();
      const draft = await draftRepo.findDraftById(id);

      if (draft) {
        return {
          success: false,
          isPendingPayment: true,
          error: "Pembayaran belum dikonfirmasi oleh DOKU.",
          draftData: JSON.parse(JSON.stringify(draft)),
        };
      }

      return {
        success: false,
        isPendingPayment: false,
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

    // Convert Prisma model to a plain JS object
    const bookingJson = JSON.parse(JSON.stringify(booking));
    bookingJson.categoryName = categoryName;

    return {
      success: true,
      isPendingPayment: false,
      data: bookingJson,
    };
  } catch (error: any) {
    console.error("getBookingByIdAction error:", error);
    return {
      success: false,
      isPendingPayment: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan server.",
    };
  }
}
