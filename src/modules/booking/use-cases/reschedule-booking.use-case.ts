import { BookingRepository } from "../repositories/booking.repository";
import { CalendarRepository } from "@/src/modules/calendar/repositories/calendar.repository";

function addMinutesToTime(timeStr: string, minutes: number): string {
  const [hours, mins] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, mins, 0, 0);
  date.setMinutes(date.getMinutes() + minutes);
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export class RescheduleBookingUseCase {
  constructor(
    private bookingRepository: BookingRepository,
    private calendarRepository: CalendarRepository
  ) {}

  async execute(id: string, newDate: Date, sessionStartTime?: string) {
    const booking = await this.bookingRepository.findBookingById(id);
    if (!booking) {
      throw new Error(`Booking dengan ID ${id} tidak ditemukan.`);
    }

    const isTimeBased = !!booking.sessionStartTime;

    const packageRepo = new (await import("../repositories/package.repository")).PackageRepository();
    const pkg = await packageRepo.findByNameOrCategory(booking.packageType);

    const targetDate = new Date(newDate);
    targetDate.setHours(12, 0, 0, 0);

    const oldDate = new Date(booking.bookingDate);
    oldDate.setHours(12, 0, 0, 0);

    let calculatedEndTime: string | undefined = undefined;
    let startTimeToUse = sessionStartTime || booking.sessionStartTime || undefined;

    if (isTimeBased) {
      if (!startTimeToUse) {
        throw new Error("Jam mulai sesi harus ditentukan.");
      }
      const duration = pkg?.sessionDuration ?? 60;
      calculatedEndTime = addMinutesToTime(startTimeToUse, duration);

      // Validate that new date is not blocked by a ManualBlock or DATE_ONLY slot
      const isBlockedOrFull = await this.bookingRepository.isDateBooked(targetDate);
      if (isBlockedOrFull) {
        throw new Error("Tanggal baru sudah dibooking atau diblokir. Silakan pilih tanggal lain.");
      }

      // Check overlap
      const isOverlapping = await this.bookingRepository.isTimeSlotOverlapping(
        targetDate,
        startTimeToUse,
        calculatedEndTime,
        id
      );
      if (isOverlapping) {
        throw new Error("Waktu sesi yang dipilih bertabrakan dengan booking lain. Silakan pilih waktu lain.");
      }
    } else {
      // Untuk DATE_ONLY: tidak boleh ada slot apapun di tanggal tujuan yang bukan milik booking ini sendiri
      const existingSlot = await this.calendarRepository.findSlotByDate(targetDate);
      if (existingSlot && existingSlot.bookingId !== id) {
        throw new Error(
          "Tanggal baru sudah memiliki pemesanan atau sesi aktif. Silakan pilih tanggal lain."
        );
      }
    }

    // Update the booking date and times
    const updatedBooking = await this.bookingRepository.rescheduleBooking(
      id,
      targetDate,
      startTimeToUse,
      calculatedEndTime,
      isTimeBased ? startTimeToUse : undefined
    );

    // Manage slots
    const status = booking.status;
    const isLockingStatus = ["PENDING", "APPROVED", "LUNAS", "ManualBooking"].includes(status);

    if (isTimeBased) {
      if (isLockingStatus) {
        // Upsert slot at targetDate
        await this.calendarRepository.upsertSlot(
          targetDate,
          "TIME_BASED_ACTIVE",
          null
        );
      }

      // Clean up old date slot if no active sessions are left
      const oldDateActiveSlots = await this.bookingRepository.getBookedTimeSlotsForDate(oldDate);
      if (oldDateActiveSlots.length === 0) {
        await this.calendarRepository.deleteSlotByDate(oldDate);
      }
    } else {
      // Delete old slot for DATE_ONLY
      await this.calendarRepository.deleteSlotByBookingId(id);

      // Create the new slot with the current booking status if it's a locking status
      if (isLockingStatus) {
        await this.calendarRepository.upsertSlot(
          targetDate,
          status,
          booking.id
        );
      }
    }

    return updatedBooking;
  }
}
