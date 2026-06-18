import { BookingRepository } from "../repositories/booking.repository";

export class GetTimeSlotsUseCase {
  constructor(private bookingRepository: BookingRepository) {}

  async execute(date: Date | string) {
    const parsedDate = typeof date === "string" ? new Date(date) : date;

    // Check if the date is fully booked or blocked by a ManualBlock / DATE_ONLY booking
    const isDateBlocked = await this.bookingRepository.isDateBooked(parsedDate);

    if (isDateBlocked) {
      return {
        isBlocked: true,
        slots: [],
      };
    }

    // Fetch active booked sessions
    const slots = await this.bookingRepository.getBookedTimeSlotsForDate(parsedDate);

    return {
      isBlocked: false,
      slots: slots.map((s: any) => ({
        startTime: s.sessionStartTime!,
        endTime: s.sessionEndTime!,
        status: s.status,
      })),
    };
  }
}
