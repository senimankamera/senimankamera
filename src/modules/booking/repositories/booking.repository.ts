import { prisma } from "@/src/infrastructure/prisma/client";

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

export interface CreateBookingInput {
  id?: string;
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
  status?: string;
  snapToken?: string;
  snapUrl?: string;
  dpAmount?: number;
  totalAmount?: number;
  source?: string;
  sessionStartTime?: string;
  sessionEndTime?: string;
}

export class BookingRepository {
  async createBooking(data: CreateBookingInput) {
    // Check if client exists, otherwise create
    const client = await prisma.client.upsert({
      where: { email: data.email },
      update: {
        fullName: data.fullName,
        ...(data.phoneNumber ? { phoneNumber: data.phoneNumber } : {}),
        ...(data.instagram ? { instagram: data.instagram } : {}),
      },
      create: {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        instagram: data.instagram,
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
          sessionStartTime: data.sessionStartTime,
          sessionEndTime: data.sessionEndTime,
        },
      });

      // Find package to check booking type
      const pkg = await tx.package.findFirst({
        where: {
          OR: [
            { name: { equals: data.packageType, mode: "insensitive" } },
            { id: data.packageType }
          ]
        },
        include: {
          category: true
        }
      });
      const isTimeBased = pkg?.category?.bookingType === "TIME_BASED";

      // Normalize date to noon to avoid timezone shift day changes
      const normalizedDate = new Date(data.bookingDate);
      normalizedDate.setHours(12, 0, 0, 0);

      if (isTimeBased) {
        // For TIME_BASED, check if CalendarSlot already exists
        const existingSlot = await tx.calendarSlot.findFirst({
          where: {
            date: {
              gte: new Date(new Date(data.bookingDate).setHours(0, 0, 0, 0)),
              lte: new Date(new Date(data.bookingDate).setHours(23, 59, 59, 999)),
            },
          },
        });
        if (!existingSlot) {
          await tx.calendarSlot.create({
            data: {
              date: normalizedDate,
              status: "TIME_BASED_ACTIVE",
              bookingId: null,
            },
          });
        }
      } else {
        // Create CalendarSlot
        await tx.calendarSlot.create({
          data: {
            date: normalizedDate,
            status: status,
            bookingId: booking.id,
          },
        });
      }

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
    // 1. Fetch active bookings
    const bookings = await prisma.booking.findMany({
      where: {
        status: {
          in: ["PENDING", "APPROVED", "LUNAS", "ManualBooking"],
        },
      },
      include: {
        client: true,
      },
    });

    // 2. Fetch manual blocks
    const manualBlocks = await prisma.calendarSlot.findMany({
      where: {
        status: "ManualBlock",
      },
    });

    // 3. Map bookings
    const bookingSlots = bookings.map((b: any) => ({
      date: b.bookingDate.toISOString(),
      eventName: b.eventName || "Sesi Foto",
      clientName: b.client?.fullName || "Klien",
      status: b.status,
      sessionStartTime: b.sessionStartTime || null,
      sessionEndTime: b.sessionEndTime || null,
      eventTime: b.eventTime || null,
    }));

    // 4. Map manual blocks
    const blockSlots = manualBlocks.map((s: any) => ({
      date: s.date.toISOString(),
      eventName: s.blockedReason || "Tanggal Diblokir",
      clientName: "Admin",
      status: s.status,
      sessionStartTime: null,
      sessionEndTime: null,
      eventTime: null,
    }));

    // 5. Combine and return
    return [...bookingSlots, ...blockSlots];
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
    } else {
      where.status = {
        notIn: ["LUNAS", "REJECTED"],
      };
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
        createdAt: "desc",
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

  async rescheduleBooking(id: string, newDate: Date, sessionStartTime?: string, sessionEndTime?: string, eventTime?: string) {
    return prisma.booking.update({
      where: { id },
      data: {
        bookingDate: newDate,
        ...(sessionStartTime ? { sessionStartTime } : {}),
        ...(sessionEndTime ? { sessionEndTime } : {}),
        ...(eventTime ? { eventTime } : {}),
      },
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

  async isTimeSlotOverlapping(date: Date, startTime: string, endTime: string, excludeBookingId?: string): Promise<boolean> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await prisma.booking.findMany({
      where: {
        bookingDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["PENDING", "APPROVED", "LUNAS", "ManualBooking"],
        },
        sessionStartTime: {
          not: null,
        },
        sessionEndTime: {
          not: null,
        },
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      },
    });

    // Check overlap dengan jeda 15 menit:
    // Booking baru tidak boleh mulai sebelum (existingEnd + 15 menit)
    const BUFFER_MINUTES = 15;
    const overlap = bookings.some((b: any) => {
      const existingStart = b.sessionStartTime!;
      const existingEnd = b.sessionEndTime!;
      // Tambahkan buffer 15 menit pada akhir sesi yang sudah ada
      const existingEndWithBuffer = addMinutesToTime(existingEnd, BUFFER_MINUTES);
      return existingStart < endTime && existingEndWithBuffer > startTime;
    });

    return overlap;
  }

  async getBookedTimeSlotsForDate(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await prisma.booking.findMany({
      where: {
        bookingDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["PENDING", "APPROVED", "LUNAS", "ManualBooking"],
        },
        sessionStartTime: {
          not: null,
        },
        sessionEndTime: {
          not: null,
        },
      },
      select: {
        sessionStartTime: true,
        sessionEndTime: true,
        status: true,
      },
      orderBy: {
        sessionStartTime: "asc",
      },
    });

    return bookings;
  }

  private async cleanupOrphanedTimeBasedSlots(bookingDates: Date[], tx: any = prisma) {
    for (const date of bookingDates) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const activeBookingsCount = await tx.booking.count({
        where: {
          bookingDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            in: ["PENDING", "APPROVED", "LUNAS", "ManualBooking"],
          },
          sessionStartTime: {
            not: null,
          },
        },
      });

      if (activeBookingsCount === 0) {
        await tx.calendarSlot.deleteMany({
          where: {
            date: {
              gte: startOfDay,
              lte: endOfDay,
            },
            status: "TIME_BASED_ACTIVE",
          },
        });
      }
    }
  }

  async deletePendingBooking(id: string) {
    return prisma.$transaction(async (tx: any) => {
      const booking = await tx.booking.findUnique({
        where: { id },
        select: {
          bookingDate: true,
          sessionStartTime: true,
        },
      });

      if (!booking) return { count: 0 };

      const result = await tx.booking.deleteMany({
        where: {
          id,
          status: "PENDING",
        },
      });

      if (booking.sessionStartTime) {
        await this.cleanupOrphanedTimeBasedSlots([booking.bookingDate], tx);
      }

      return result;
    });
  }

  async findHistoryBookings() {
    return prisma.booking.findMany({
      where: {
        status: {
          in: ["LUNAS", "REJECTED"],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        client: true,
      },
    });
  }

  async deleteBooking(id: string) {
    return prisma.$transaction(async (tx: any) => {
      const booking = await tx.booking.findUnique({
        where: { id },
        select: {
          bookingDate: true,
          sessionStartTime: true,
        },
      });

      if (!booking) {
        throw new Error("Booking tidak ditemukan.");
      }

      const result = await tx.booking.delete({
        where: { id },
      });

      if (booking.sessionStartTime) {
        await this.cleanupOrphanedTimeBasedSlots([booking.bookingDate], tx);
      }

      return result;
    });
  }

  async deleteMultipleBookings(ids: string[]) {
    return prisma.$transaction(async (tx: any) => {
      const bookings = await tx.booking.findMany({
        where: {
          id: {
            in: ids,
          },
        },
        select: {
          bookingDate: true,
          sessionStartTime: true,
        },
      });

      const result = await tx.booking.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });

      const timeBasedDates = bookings
        .filter((b: any) => b.sessionStartTime)
        .map((b: any) => b.bookingDate);

      if (timeBasedDates.length > 0) {
        const uniqueDates = Array.from(
          new Set(timeBasedDates.map((d: any) => d.toISOString()))
        ).map((iso) => new Date(iso as string));

        await this.cleanupOrphanedTimeBasedSlots(uniqueDates, tx);
      }

      return result;
    });
  }
}

