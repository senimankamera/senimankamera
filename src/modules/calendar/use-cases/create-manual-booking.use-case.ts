import { BookingRepository, CreateBookingInput } from "@/src/modules/booking/repositories/booking.repository";
import { PackageRepository } from "@/src/modules/booking/repositories/package.repository";

export interface CreateManualBookingInput {
  fullName: string;
  email: string;
  phoneNumber?: string;
  instagram?: string;
  packageType: string;
  bookingDate: Date;
  eventTime?: string;
  eventName?: string;
  eventLocation?: string;
  notes?: string;
}

function addMinutesToTime(timeStr: string, minutes: number): string {
  const [hours, mins] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, mins, 0, 0);
  date.setMinutes(date.getMinutes() + minutes);
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export class CreateManualBookingUseCase {
  constructor(
    private bookingRepository: BookingRepository,
    private packageRepository: PackageRepository
  ) {}

  async execute(input: CreateManualBookingInput) {
    const bookingDate = new Date(input.bookingDate);
    bookingDate.setHours(12, 0, 0, 0);

    const targetPackage = await this.packageRepository.findByNameOrCategory(input.packageType);
    const bookingType = targetPackage?.category?.bookingType ?? "DATE_ONLY";

    let calculatedEndTime: string | undefined = undefined;

    if (bookingType === "DATE_ONLY") {
      const isBooked = await this.bookingRepository.isDateBooked(bookingDate);
      if (isBooked) {
        throw new Error("Tanggal ini sudah terisi. Silakan pilih tanggal lain.");
      }
    } else if (bookingType === "TIME_BASED") {
      // Check if date is blocked or booked by DATE_ONLY
      const isBlockedOrFull = await this.bookingRepository.isDateBooked(bookingDate);
      if (isBlockedOrFull) {
        throw new Error("Tanggal yang Anda pilih sudah dibooking atau diblokir. Silakan pilih tanggal lain.");
      }

      if (!input.eventTime) {
        throw new Error("Jam mulai sesi harus ditentukan untuk kategori ini.");
      }

      const duration = targetPackage?.sessionDuration ?? 60;
      calculatedEndTime = addMinutesToTime(input.eventTime, duration);

      // Check overlapping
      const isOverlapping = await this.bookingRepository.isTimeSlotOverlapping(
        bookingDate,
        input.eventTime,
        calculatedEndTime
      );
      if (isOverlapping) {
        throw new Error("Waktu sesi yang dipilih bertabrakan dengan booking lain. Silakan pilih waktu lain.");
      }
    }

    const totalAmount = targetPackage?.price || 0;
    const dpAmount = bookingType === "TIME_BASED" ? 150000 : totalAmount * 0.2;

    const crypto = require("crypto");
    const manualOrderId = `manual-${crypto.randomUUID().substring(0, 8)}`;

    const data: CreateBookingInput = {
      id: manualOrderId,
      fullName: input.fullName,
      email: input.email,
      phoneNumber: input.phoneNumber,
      instagram: input.instagram,
      packageType: targetPackage?.name || input.packageType,
      bookingDate: bookingDate,
      eventTime: input.eventTime,
      eventName: bookingType === "TIME_BASED" ? "Foto Studio Session" : input.eventName,
      eventLocation: bookingType === "TIME_BASED" ? "Studio" : input.eventLocation,
      notes: input.notes,
      status: "ManualBooking",
      dpAmount: dpAmount,
      totalAmount: totalAmount,
      source: "manual",
      sessionStartTime: bookingType === "TIME_BASED" ? input.eventTime : undefined,
      sessionEndTime: bookingType === "TIME_BASED" ? calculatedEndTime : undefined,
    };

    return this.bookingRepository.createBooking(data);
  }
}
