"use server";

import { BookingRepository } from "@/src/modules/booking/repositories/booking.repository";
import { PackageRepository } from "@/src/modules/booking/repositories/package.repository";
import { CreateManualBookingUseCase, CreateManualBookingInput } from "../use-cases/create-manual-booking.use-case";
import { revalidatePath } from "next/cache";

export async function createManualBookingAction(input: {
  fullName: string;
  email: string;
  phoneNumber?: string;
  instagram?: string;
  packageType: string;
  bookingDateStr: string;
  eventTime?: string;
  eventName?: string;
  eventLocation?: string;
  notes?: string;
}) {
  try {
    const bookingRepository = new BookingRepository();
    const packageRepository = new PackageRepository();
    const useCase = new CreateManualBookingUseCase(bookingRepository, packageRepository);

    const bookingDate = new Date(input.bookingDateStr);
    const result = await useCase.execute({
      fullName: input.fullName,
      email: input.email,
      phoneNumber: input.phoneNumber,
      instagram: input.instagram,
      packageType: input.packageType,
      bookingDate: bookingDate,
      eventTime: input.eventTime,
      eventName: input.eventName,
      eventLocation: input.eventLocation,
      notes: input.notes,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/calendar");
    revalidatePath("/booking");

    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    console.error("createManualBookingAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal membuat booking manual." };
  }
}
