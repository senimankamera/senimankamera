import { BookingRepository, CreateBookingInput } from "../repositories/booking.repository";
import { PackageRepository } from "../repositories/package.repository";
import { CreateBookingSchema, CreateBookingInputType } from "../schemas/create-booking.schema";

function addMinutesToTime(timeStr: string, minutes: number): string {
  const [hours, mins] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, mins, 0, 0);
  date.setMinutes(date.getMinutes() + minutes);
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export class CreateBookingUseCase {
  constructor(private bookingRepository: BookingRepository) {}

  async execute(input: CreateBookingInputType) {
    // Validate schema
    const parsed = CreateBookingSchema.parse(input);

    const bookingDate = new Date(parsed.bookingDate);

    // Get package price details
    const packageRepo = new PackageRepository();
    const targetPackage = await packageRepo.findByNameOrCategory(parsed.packageType);

    const bookingType = targetPackage?.category?.bookingType ?? "DATE_ONLY";

    let calculatedEndTime: string | undefined = undefined;

    if (bookingType === "DATE_ONLY") {
      // Check if the date is already booked or blocked
      const isBooked = await this.bookingRepository.isDateBooked(bookingDate);
      if (isBooked) {
        throw new Error("Tanggal yang Anda pilih sudah dibooking. Silakan pilih tanggal lain.");
      }
    } else if (bookingType === "TIME_BASED") {
      // Check if the date is fully blocked (ManualBlock) or already booked by a DATE_ONLY package
      const isBlockedOrFull = await this.bookingRepository.isDateBooked(bookingDate);
      if (isBlockedOrFull) {
        throw new Error("Tanggal yang Anda pilih sudah dibooking atau diblokir. Silakan pilih tanggal lain.");
      }

      if (!parsed.sessionStartTime) {
        throw new Error("Jam mulai sesi harus ditentukan untuk kategori ini.");
      }

      const duration = targetPackage?.sessionDuration ?? 60; // Default 60 minutes
      calculatedEndTime = addMinutesToTime(parsed.sessionStartTime, duration);

      // Check if time slot is overlapping
      const isOverlapping = await this.bookingRepository.isTimeSlotOverlapping(
        bookingDate,
        parsed.sessionStartTime,
        calculatedEndTime
      );
      if (isOverlapping) {
        throw new Error("Waktu sesi yang dipilih bertabrakan dengan booking lain. Silakan pilih waktu lain.");
      }
    }

    const totalAmountIdr = targetPackage?.price || 1500000; // Default price if not found
    const DP_FLAT_TIME_BASED = 150_000;
    const dpAmountIdr =
      bookingType === "TIME_BASED" ? DP_FLAT_TIME_BASED : totalAmountIdr * 0.2;

    // Generate a booking ID
    const crypto = require("crypto");
    const tempOrderId = crypto.randomUUID();

    // Call Midtrans Service to generate a Snap token
    const { MidtransService } = require("@/src/infrastructure/midtrans/midtrans.service");
    const midtransService = new MidtransService();
    let snapResult = { token: "", redirectUrl: "" };

    try {
      snapResult = await midtransService.createSnapTransaction({
        orderId: tempOrderId,
        grossAmount: dpAmountIdr,
        customerDetails: {
          firstName: parsed.fullName,
          email: parsed.email,
          phone: parsed.phoneNumber || undefined,
        },
        itemDetails: [
          {
            id: targetPackage?.id || "package",
            price: dpAmountIdr,
            quantity: 1,
            name: `DP - ${targetPackage?.name || parsed.packageType}`,
          }
        ]
      });
    } catch (err) {
      console.error("Failed to create Midtrans Snap transaction, using fallback:", err);
    }

    const data: CreateBookingInput = {
      id: tempOrderId,
      fullName: parsed.fullName,
      email: parsed.email,
      phoneNumber: parsed.phoneNumber,
      packageType: targetPackage?.name || parsed.packageType,
      bookingDate: bookingDate,
      eventTime: bookingType === "TIME_BASED" ? parsed.sessionStartTime : parsed.eventTime,
      eventName: bookingType === "TIME_BASED" ? "Foto Studio Session" : parsed.eventName,
      eventLocation: bookingType === "TIME_BASED" ? "Studio" : parsed.eventLocation,
      notes: parsed.notes || undefined,
      snapToken: snapResult.token || undefined,
      snapUrl: snapResult.redirectUrl || undefined,
      dpAmount: dpAmountIdr,
      totalAmount: totalAmountIdr,
      status: "PENDING",
      sessionStartTime: parsed.sessionStartTime || undefined,
      sessionEndTime: calculatedEndTime || undefined,
    };

    const booking = await this.bookingRepository.createBooking(data);
    return booking;
  }
}
