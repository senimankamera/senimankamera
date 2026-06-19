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

export class CreateManualBookingUseCase {
  constructor(
    private bookingRepository: BookingRepository,
    private packageRepository: PackageRepository
  ) {}

  async execute(input: CreateManualBookingInput) {
    const bookingDate = new Date(input.bookingDate);
    bookingDate.setHours(12, 0, 0, 0);

    const isBooked = await this.bookingRepository.isDateBooked(bookingDate);
    if (isBooked) {
      throw new Error("Tanggal ini sudah terisi. Silakan pilih tanggal lain.");
    }

    const targetPackage = await this.packageRepository.findByNameOrCategory(input.packageType);
    const totalAmount = targetPackage?.price || 0;
    const dpAmount = totalAmount * 0.5;

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
      eventName: input.eventName,
      eventLocation: input.eventLocation,
      notes: input.notes,
      status: "ManualBooking",
      dpAmount: dpAmount,
      totalAmount: totalAmount,
      source: "manual",
    };

    return this.bookingRepository.createBooking(data);
  }
}
