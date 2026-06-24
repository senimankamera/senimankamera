import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { BookingRepository } from "@/src/modules/booking/repositories/booking.repository";
import { createClient } from "@/src/infrastructure/supabase/server";
import { BookingsClient } from "./bookings-client";

export const revalidate = 0;

import { enforceAdminRole } from "@/src/modules/auth/services/auth.service";
import { AdminRole } from "@prisma/client";

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: any;
}) {
  const resolvedParams = searchParams ? (typeof searchParams.then === 'function' ? await searchParams : searchParams) : {};
  const initialStatusFilter = resolvedParams.status || "";

  const admin = await enforceAdminRole([AdminRole.SUPER_ADMIN, AdminRole.ADMIN_PESANAN]);

  const bookingRepository = new BookingRepository();
  const rawBookings = await bookingRepository.findAllBookings({});

  // Serialize dates for Client Component safety
  const bookings = rawBookings.map((b: any) => ({
    id: b.id,
    clientId: b.clientId,
    client: {
      fullName: b.client.fullName,
      email: b.client.email,
      phoneNumber: b.client.phoneNumber,
    },
    packageType: b.packageType,
    bookingDate: b.bookingDate.toISOString(),
    eventTime: b.eventTime,
    eventName: b.eventName,
    eventLocation: b.eventLocation,
    notes: b.notes,
    status: b.status,
    source: b.source,
    dpAmount: b.dpAmount,
    totalAmount: b.totalAmount,
    sessionStartTime: b.sessionStartTime,
    sessionEndTime: b.sessionEndTime,
    createdAt: b.createdAt.toISOString(),
  }));

  return (
    <SidebarProvider>
      <AdminSidebar variant="sidebar" />
      <SidebarInset className="flex flex-col min-h-screen bg-background text-foreground">
        <AdminHeader title="Manajemen Studio Seniman Kamera" />

        {/* Content Container */}
        <main className="flex-1 px-6 md:px-12 py-10 max-w-[1200px] mx-auto w-full">
          <BookingsClient initialBookings={bookings} initialStatusFilter={initialStatusFilter} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}