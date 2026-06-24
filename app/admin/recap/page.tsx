import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { BookingRepository } from "@/src/modules/booking/repositories/booking.repository";
import { createClient } from "@/src/infrastructure/supabase/server";
import { RecapClient } from "./recap-client";

export const revalidate = 0;

import { enforceAdminRole } from "@/src/modules/auth/services/auth.service";
import { AdminRole } from "@prisma/client";

export default async function AdminRecapPage() {
  const admin = await enforceAdminRole([AdminRole.SUPER_ADMIN, AdminRole.ADMIN_PESANAN]);

  const bookingRepository = new BookingRepository();
  const rawBookings = await bookingRepository.getRecapData();

  // Serialize bookings and their payment transactions for Client Component safety
  const bookings = rawBookings.map((b: any) => ({
    id: b.id,
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
    totalAmount: b.totalAmount || 0,
    dpAmount: b.dpAmount || 0,
    paymentTransactions: b.paymentTransactions.map((t: any) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      createdAt: t.createdAt.toISOString(),
    })),
    createdAt: b.createdAt.toISOString(),
  }));

  return (
    <SidebarProvider>
      <AdminSidebar variant="sidebar" />
      <SidebarInset className="flex flex-col min-h-screen bg-background text-foreground">
        <AdminHeader title="Manajemen Studio Seniman Kamera" />

        {/* Content Container */}
        <main className="flex-1 px-6 md:px-12 py-10 max-w-[1200px] mx-auto w-full">
          <RecapClient bookings={bookings} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
