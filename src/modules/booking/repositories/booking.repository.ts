import { prisma } from "@/src/infrastructure/prisma/client";

export interface CreateBookingInput {
  id?: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  packageType: string;
  bookingDate: Date;
  eventTime?: string;
  eventName?: string;
  eventLocation?: string;
  notes?: string;
  status?: string;
  snapToken?: string;
  snapUrl?: string;
  dpAmount?: number;
  totalAmount?: number;
  source?: string;
}

export class BookingRepository {
  async createBooking(data: CreateBookingInput) {
    // Check if client exists, otherwise create
    const client = await prisma.client.upsert({
      where: { email: data.email },
      update: {
        fullName: data.fullName,
        ...(data.phoneNumber ? { phoneNumber: data.phoneNumber } : {}),
      },
      create: {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
      },
    });

    const status = data.status || "PENDING";
    const source = data.source || (data.status === "ManualBooking" ? "manual" : "website");

    // Create booking and slot in transaction
    return prisma.$transaction(async (tx: any) => {
      const booking = await tx.booking.create({
        data: {
          id: data.id,
          clientId: client.id,
          packageType: data.packageType,
          bookingDate: data.bookingDate,
          eventTime: data.eventTime,
          eventName: data.eventName,
          eventLocation: data.eventLocation,
          notes: data.notes,
          status: status,
          snapToken: data.snapToken,
          snapUrl: data.snapUrl,
          dpAmount: data.dpAmount,
          totalAmount: data.totalAmount,
          source: source,
        },
      });

      // Normalize date to noon to avoid timezone shift day changes
      const normalizedDate = new Date(data.bookingDate);
      normalizedDate.setHours(12, 0, 0, 0);

      // Create CalendarSlot
      await tx.calendarSlot.create({
        data: {
          date: normalizedDate,
          status: status,
          bookingId: booking.id,
        },
      });

      return booking;
    });
  }

  async findRecentBookings(limit: number = 10) {
    return prisma.booking.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        client: true,
      },
    });
  }

  async isDateBooked(date: Date): Promise<boolean> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const count = await prisma.calendarSlot.count({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["PENDING", "APPROVED", "LUNAS", "ManualBooking", "ManualBlock"],
        },
      },
    });

    return count > 0;
  }

  async getBookedDates(): Promise<Date[]> {
    const slots = await prisma.calendarSlot.findMany({
      where: {
        status: {
          in: ["PENDING", "APPROVED", "LUNAS", "ManualBooking", "ManualBlock"],
        },
      },
      select: {
        date: true,
      },
    });

    return slots.map((s: any) => s.date);
  }

  async getBookingsCalendarInfo() {
    const slots = await prisma.calendarSlot.findMany({
      where: {
        status: {
          in: ["PENDING", "APPROVED", "LUNAS", "ManualBooking", "ManualBlock"],
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

    return slots.map((s: any) => ({
      date: s.date.toISOString(),
      eventName: s.blockedReason || s.booking?.eventName || "Manual Block",
      clientName: s.booking?.client?.fullName || "Admin",
      status: s.status,
    }));
  }


  async findBookingById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        client: true,
      },
    });
  }

  async findAllBookings(filters: { status?: string; month?: number; year?: number; search?: string }) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.year !== undefined || filters.month !== undefined) {
      const year = filters.year ?? new Date().getFullYear();
      let startDate: Date;
      let endDate: Date;

      if (filters.month !== undefined) {
        startDate = new Date(year, filters.month - 1, 1);
        endDate = new Date(year, filters.month, 0, 23, 59, 59, 999);
      } else {
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 12, 0, 23, 59, 59, 999);
      }

      where.bookingDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (filters.search) {
      where.OR = [
        { client: { fullName: { contains: filters.search, mode: 'insensitive' } } },
        { client: { email: { contains: filters.search, mode: 'insensitive' } } },
        { client: { phoneNumber: { contains: filters.search, mode: 'insensitive' } } },
        { eventName: { contains: filters.search, mode: 'insensitive' } },
        { packageType: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.booking.findMany({
      where,
      orderBy: {
        bookingDate: "desc",
      },
      include: {
        client: true,
      },
    });
  }

  async updateBookingStatus(id: string, status: string) {
    return prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        client: true,
      },
    });
  }

  async rescheduleBooking(id: string, newDate: Date) {
    return prisma.booking.update({
      where: { id },
      data: { bookingDate: newDate },
      include: {
        client: true,
      },
    });
  }

  async getDashboardStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Revenue from PaymentTransaction
    const [allRevenue, monthRevenue, todayRevenue] = await Promise.all([
      prisma.paymentTransaction.aggregate({ _sum: { amount: true } }),
      prisma.paymentTransaction.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: startOfMonth } } }),
      prisma.paymentTransaction.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: startOfToday } } }),
    ]);

    // Booking counts by status
    const bookings = await prisma.booking.findMany({
      select: {
        status: true,
      },
    });

    let totalBookings = 0;
    let pendingCount = 0;
    let approvedCount = 0;
    let lunasCount = 0;
    let cancelledCount = 0;
    let actionRequired = 0;

    for (const booking of bookings) {
      totalBookings++;
      if (booking.status === "PENDING") {
        pendingCount++;
        actionRequired++;
      } else if (booking.status === "APPROVED") {
        approvedCount++;
      } else if (booking.status === "LUNAS") {
        lunasCount++;
      } else if (booking.status === "CANCELLED") {
        cancelledCount++;
      }
    }

    return {
      revenue: allRevenue._sum.amount ?? 0,
      revenueMonth: monthRevenue._sum.amount ?? 0,
      revenueToday: todayRevenue._sum.amount ?? 0,
      totalBookings,
      pendingCount,
      approvedCount,
      lunasCount,
      cancelledCount,
      actionRequired,
    };
  }

  async getUpcomingSchedule(limit: number = 5) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.booking.findMany({
      where: {
        bookingDate: {
          gte: today,
        },
        status: {
          in: ["APPROVED", "LUNAS"],
        },
      },
      orderBy: {
        bookingDate: "asc",
      },
      take: limit,
      include: {
        client: true,
      },
    });
  }

  async getRecapData(from?: Date, to?: Date) {
    const where: any = {};
    if (from || to) {
      where.bookingDate = {};
      if (from) {
        where.bookingDate.gte = from;
      }
      if (to) {
        where.bookingDate.lte = to;
      }
    }

    return prisma.booking.findMany({
      where,
      orderBy: {
        bookingDate: "desc",
      },
      include: {
        client: true,
        paymentTransactions: true,
      },
    });
  }
}

