import { BookingRepository } from "../repositories/booking.repository";
import { CalendarRepository } from "@/src/modules/calendar/repositories/calendar.repository";

export class RescheduleBookingUseCase {
  constructor(
    private bookingRepository: BookingRepository,
    private calendarRepository: CalendarRepository
  ) {}

  async execute(id: string, newDate: Date) {
    const booking = await this.bookingRepository.findBookingById(id);
    if (!booking) {
      throw new Error(`Booking dengan ID ${id} tidak ditemukan.`);
    }

    const targetDate = new Date(newDate);
    targetDate.setHours(12, 0, 0, 0);

    // Validate that the new date is not booked by another booking/slot
    const isBooked = await this.bookingRepository.isDateBooked(targetDate);
    if (isBooked) {
      // Check if the slot belongs to this booking (rescheduling to the same date is allowed)
      const existingSlot = await this.calendarRepository.findSlotByDate(targetDate);
      if (existingSlot && existingSlot.bookingId !== id) {
        throw new Error("Tanggal baru sudah dibooking. Silakan pilih tanggal lain.");
      }
    }

    // Delete the old slot
    await this.calendarRepository.deleteSlotByBookingId(id);

    // Update the booking date
    const updatedBooking = await this.bookingRepository.rescheduleBooking(id, targetDate);

    // Create the new slot with the current booking status if it's a locking status
    const status = booking.status;
    const isLockingStatus = ["PENDING", "APPROVED", "LUNAS", "ManualBooking"].includes(status);
    if (isLockingStatus) {
      await this.calendarRepository.upsertSlot(
        targetDate,
        status,
        booking.id
      );
    }

    return updatedBooking;
  }
}
