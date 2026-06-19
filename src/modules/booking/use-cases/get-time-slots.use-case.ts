import { BookingRepository } from "../repositories/booking.repository";

// Helper: tambah menit ke string waktu "HH:MM"
function addMinutesToTime(timeStr: string, minutes: number): string {
  const [hours, mins] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, mins, 0, 0);
  date.setMinutes(date.getMinutes() + minutes);
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

const BUFFER_MINUTES = 15;

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
        // Kembalikan endTime + 15 menit jeda agar UI menampilkan slot yang benar
        endTime: addMinutesToTime(s.sessionEndTime!, BUFFER_MINUTES),
        status: s.status,
      })),
    };
  }
}
