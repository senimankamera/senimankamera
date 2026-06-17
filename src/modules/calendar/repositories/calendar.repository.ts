import { prisma } from "@/src/infrastructure/prisma/client";

export class CalendarRepository {
  async findSlotByDate(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.calendarSlot.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        booking: {
          include: {
            client: true,
          },
        },
      },
    });
  }

  async findSlotsByMonth(year: number, month: number) {
    // month is 1-indexed (1-12)
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    return prisma.calendarSlot.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        booking: {
          include: {
            client: true,
          },
        },
      },
    });
  }

  async upsertSlot(
    date: Date,
    status: string,
    bookingId?: string | null,
    blockedReason?: string | null,
    createdBy?: string | null
  ) {
    const startOfDay = new Date(date);
    startOfDay.setHours(12, 0, 0, 0); // Normalize to noon to avoid timezone shift day changes

    // Cek dulu apakah slot tanggal tersebut sudah ada
    const existing = await prisma.calendarSlot.findFirst({
      where: {
        date: {
          gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
          lte: new Date(new Date(date).setHours(23, 59, 59, 999)),
        },
      },
    });

    if (existing) {
      return prisma.calendarSlot.update({
        where: { id: existing.id },
        data: {
          status,
          bookingId: bookingId || null,
          blockedReason: blockedReason || null,
          createdBy: createdBy || null,
        },
      });
    }

    return prisma.calendarSlot.create({
      data: {
        date: startOfDay,
        status,
        bookingId: bookingId || null,
        blockedReason: blockedReason || null,
        createdBy: createdBy || null,
      },
    });
  }

  async deleteSlotByDate(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await prisma.calendarSlot.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existing) {
      return prisma.calendarSlot.delete({
        where: { id: existing.id },
      });
    }
    return null;
  }

  async deleteSlotByBookingId(bookingId: string) {
    const existing = await prisma.calendarSlot.findFirst({
      where: { bookingId },
    });

    if (existing) {
      return prisma.calendarSlot.delete({
        where: { id: existing.id },
      });
    }
    return null;
  }

  async findUpcomingSlots(limit: number = 5) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.calendarSlot.findMany({
      where: {
        date: {
          gte: today,
        },
        status: {
          not: "ManualBlock",
        },
      },
      orderBy: {
        date: "asc",
      },
      take: limit,
      include: {
        booking: {
          include: {
            client: true,
          },
        },
      },
    });
  }

  async getCalendarStats() {
    const activeBookingsCount = await prisma.booking.count({
      where: {
        status: {
          in: ["APPROVED", "LUNAS", "ManualBooking", "PENDING"],
        },
      },
    });

    const pendingCount = await prisma.booking.count({
      where: { status: "PENDING" },
    });

    const approvedCount = await prisma.booking.count({
      where: { status: "APPROVED" },
    });

    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const startOfMonth = new Date(thisYear, thisMonth, 1);
    const endOfMonth = new Date(thisYear, thisMonth + 1, 0, 23, 59, 59, 999);

    const thisMonthBookingsCount = await prisma.booking.count({
      where: {
        bookingDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: {
          not: "CANCELLED",
        },
      },
    });

    const blockedCount = await prisma.calendarSlot.count({
      where: { status: "ManualBlock" },
    });

    const cancelledCount = await prisma.booking.count({
      where: { status: "CANCELLED" },
    });

    return {
      activeBookings: activeBookingsCount,
      pendingApproval: pendingCount,
      approved: approvedCount,
      bookingsThisMonth: thisMonthBookingsCount,
      blockedDates: blockedCount,
      cancelled: cancelledCount,
    };
  }
}
