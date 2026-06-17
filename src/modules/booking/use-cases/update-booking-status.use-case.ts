import { BookingRepository } from "../repositories/booking.repository";
import { CalendarRepository } from "@/src/modules/calendar/repositories/calendar.repository";
import { TelegramService } from "@/src/infrastructure/telegram/telegram.service";

export class UpdateBookingStatusUseCase {
  constructor(
    private bookingRepository: BookingRepository,
    private calendarRepository: CalendarRepository
  ) {}

  async execute(id: string, status: string) {
    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "LUNAS"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Status tidak valid: ${status}`);
    }

    const booking = await this.bookingRepository.findBookingById(id);
    if (!booking) {
      throw new Error(`Booking dengan ID ${id} tidak ditemukan.`);
    }

    // Update booking status
    const updatedBooking = await this.bookingRepository.updateBookingStatus(id, status);

    // Update or create CalendarSlot status based on booking status
    const startOfDay = new Date(booking.bookingDate);
    startOfDay.setHours(12, 0, 0, 0);

    const isLockingStatus = ["PENDING", "APPROVED", "LUNAS"].includes(status);

    if (isLockingStatus) {
      // Upsert the slot
      await this.calendarRepository.upsertSlot(
        startOfDay,
        status,
        booking.id
      );
    } else {
      // For Rejected, Cancelled, we delete the slot so the date becomes 100% clean and available.
      await this.calendarRepository.deleteSlotByBookingId(booking.id);
    }

    // Process payment ledger (PaymentTransaction)
    const prismaModule = await import("@/src/infrastructure/prisma/client");
    const totalAmount = booking.totalAmount || 0;
    if (status === "APPROVED") {
      const dpAmount = totalAmount * 0.2;
      await prismaModule.prisma.paymentTransaction.upsert({
        where: { uniqueKey: `${booking.id}-DP` },
        update: {},
        create: {
          bookingId: booking.id,
          type: "DP",
          amount: dpAmount,
          uniqueKey: `${booking.id}-DP`,
        },
      });
    } else if (status === "LUNAS") {
      const dpAmount = totalAmount * 0.2;
      const fullAmount = totalAmount * 0.8;
      // Ensure DP is also recorded in case they skipped APPROVED
      await prismaModule.prisma.paymentTransaction.upsert({
        where: { uniqueKey: `${booking.id}-DP` },
        update: {},
        create: {
          bookingId: booking.id,
          type: "DP",
          amount: dpAmount,
          uniqueKey: `${booking.id}-DP`,
        },
      });
      // Record FULL payment
      await prismaModule.prisma.paymentTransaction.upsert({
        where: { uniqueKey: `${booking.id}-FULL` },
        update: {},
        create: {
          bookingId: booking.id,
          type: "FULL",
          amount: fullAmount,
          uniqueKey: `${booking.id}-FULL`,
        },
      });
    }

    // Send Telegram Notification for APPROVED, REJECTED, or LUNAS
    if (status === "APPROVED" || status === "REJECTED" || status === "LUNAS") {
      const telegramService = new TelegramService();
      await telegramService.sendBookingStatusNotification(
        booking.client.fullName,
        booking.eventName || booking.packageType,
        booking.bookingDate,
        status
      );
    }

    return updatedBooking;
  }
}
