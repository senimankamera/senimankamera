import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { BookingRepository } from "@/src/modules/booking/repositories/booking.repository";
import { createClient } from "@/src/infrastructure/supabase/server";
import { BookingsClient } from "./bookings-client";

export const revalidate = 0;

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: any;
}) {
  const resolvedParams = searchParams ? (typeof searchParams.then === 'function' ? await searchParams : searchParams) : {};
  const initialStatusFilter = resolvedParams.status || "";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Auth check
  if (!user) {
    redirect("/login");
  }

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
        {/* Header App Bar */}
        <header className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-border/40 bg-background sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-secondary hover:text-primary transition-colors" />
            <span className="font-serif tracking-tighter font-semibold md:hidden">Admin</span>
            <div className="hidden md:block">
              <span className="font-sans text-[10px] uppercase tracking-widest text-secondary font-bold">
                Manajemen Studio Seniman Kamera
              </span>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 px-6 md:px-12 py-10 max-w-[1200px] mx-auto w-full">
          <BookingsClient initialBookings={bookings} initialStatusFilter={initialStatusFilter} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}