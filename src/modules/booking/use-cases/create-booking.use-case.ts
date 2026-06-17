import { BookingRepository, CreateBookingInput } from "../repositories/booking.repository";
import { PackageRepository } from "../repositories/package.repository";
import { CreateBookingSchema, CreateBookingInputType } from "../schemas/create-booking.schema";

export class CreateBookingUseCase {
  constructor(private bookingRepository: BookingRepository) {}

  async execute(input: CreateBookingInputType) {
    // Validate schema
    const parsed = CreateBookingSchema.parse(input);

    const bookingDate = new Date(parsed.bookingDate);

    // Check if the date is already booked
    const isBooked = await this.bookingRepository.isDateBooked(bookingDate);
    if (isBooked) {
      throw new Error("Tanggal yang Anda pilih sudah dibooking. Silakan pilih tanggal lain.");
    }

    // Get package price details
    const packageRepo = new PackageRepository();
    const targetPackage = await packageRepo.findByNameOrCategory(parsed.packageType);

    const totalAmountIdr = targetPackage?.price || 1500000; // Default price if not found
    const dpAmountIdr = totalAmountIdr * 0.2; // DP is 20% globally

    // Generate a booking ID
    const crypto = require("crypto");
    const tempOrderId = crypto.randomUUID();

    // Midtrans is bypassed for now as requested (direct simulation)
    // To enable Midtrans later, uncomment the following block:
    /*
    const { MidtransService } = require("@/src/infrastructure/midtrans/midtrans.service");
    const midtransService = new MidtransService();
    const snapResult = await midtransService.createSnapTransaction({
      orderId: tempOrderId,
      grossAmount: dpAmountIdr,
      customerDetails: {
        firstName: parsed.fullName,
        email: parsed.email,
        phone: parsed.phoneNumber,
      },
      itemDetails: [
        {
          id: targetPackage?.id || "custom-pkg",
          price: dpAmountIdr,
          quantity: 1,
          name: `DP 20% - ${targetPackage?.name || parsed.packageType}`,
        },
      ],
    });
    */
    const snapResult = {
      token: "",
      redirectUrl: "",
    };

    const data: CreateBookingInput = {
      id: tempOrderId,
      fullName: parsed.fullName,
      email: parsed.email,
      phoneNumber: parsed.phoneNumber,
      packageType: targetPackage?.name || parsed.packageType,
      bookingDate: bookingDate,
      eventTime: parsed.eventTime,
      eventName: parsed.eventName,
      eventLocation: parsed.eventLocation,
      notes: parsed.notes || undefined,
      snapToken: snapResult.token || undefined,
      snapUrl: snapResult.redirectUrl || undefined,
      dpAmount: dpAmountIdr,
      totalAmount: totalAmountIdr,
      status: "PENDING",
    };

    const booking = await this.bookingRepository.createBooking(data);
    return booking;
  }
}
