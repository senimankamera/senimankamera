import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { CalendarRepository } from "@/src/modules/calendar/repositories/calendar.repository";
import { PackageRepository } from "@/src/modules/booking/repositories/package.repository";
import { createClient } from "@/src/infrastructure/supabase/server";
import { CalendarClient } from "./calendar-client";
import { prisma } from "@/src/infrastructure/prisma/client";

export const revalidate = 0;

import { enforceAdminRole } from "@/src/modules/auth/services/auth.service";
import { AdminRole } from "@prisma/client";

export default async function AdminCalendarPage() {
  const admin = await enforceAdminRole([AdminRole.SUPER_ADMIN, AdminRole.ADMIN_PESANAN]);

  const calendarRepository = new CalendarRepository();
  const packageRepository = new PackageRepository();

  const rawSlots = await prisma.calendarSlot.findMany({
    include: {
      booking: {
        include: {
          client: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  const rawPackages = await packageRepository.findAll();
  const stats = await calendarRepository.getCalendarStats();

  const rawTimeBasedBookings = await prisma.booking.findMany({
    where: {
      sessionStartTime: {
        not: null,
      },
      status: {
        in: ["PENDING", "APPROVED", "LUNAS", "ManualBooking"],
      },
    },
    include: {
      client: true,
    },
    orderBy: {
      bookingDate: "asc",
    },
  });

  // Serialize objects for client side
  const slots = rawSlots.map((s: any) => ({
    id: s.id,
    date: s.date.toISOString(),
    status: s.status,
    bookingId: s.bookingId,
    booking: s.booking
      ? {
          id: s.booking.id,
          clientId: s.booking.clientId,
          client: {
            fullName: s.booking.client.fullName,
            email: s.booking.client.email,
            phoneNumber: s.booking.client.phoneNumber,
            instagram: s.booking.client.instagram,
          },
          packageType: s.booking.packageType,
          bookingDate: s.booking.bookingDate.toISOString(),
          eventTime: s.booking.eventTime,
          eventName: s.booking.eventName,
          eventLocation: s.booking.eventLocation,
          notes: s.booking.notes,
          status: s.booking.status,
          source: s.booking.source,
        }
      : null,
    blockedReason: s.blockedReason,
    createdBy: s.createdBy,
  }));

  const timeBasedBookings = rawTimeBasedBookings.map((b: any) => ({
    id: b.id,
    clientId: b.clientId,
    client: {
      fullName: b.client.fullName,
      email: b.client.email,
      phoneNumber: b.client.phoneNumber,
      instagram: b.client.instagram,
    },
    packageType: b.packageType,
    bookingDate: b.bookingDate.toISOString(),
    sessionStartTime: b.sessionStartTime,
    sessionEndTime: b.sessionEndTime,
    eventName: b.eventName,
    notes: b.notes,
    status: b.status,
    source: b.source,
  }));

  const packages = rawPackages.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    categoryName: p.category?.name || "",
    bookingType: p.category?.bookingType || "DATE_ONLY",
  }));

  return (
    <SidebarProvider>
      <AdminSidebar variant="sidebar" />
      <SidebarInset className="flex flex-col min-h-screen bg-background text-foreground">
        <AdminHeader title="Manajemen Studio Seniman Kamera" />

        {/* Content Container */}
        <main className="flex-1 px-6 md:px-12 py-10 max-w-[1200px] mx-auto w-full">
          <CalendarClient initialSlots={slots} timeBasedBookings={timeBasedBookings} packages={packages} stats={stats} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}