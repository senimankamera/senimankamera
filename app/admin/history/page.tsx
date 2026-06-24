import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { BookingRepository } from "@/src/modules/booking/repositories/booking.repository";
import { PackageRepository } from "@/src/modules/booking/repositories/package.repository";
import { CategoryRepository } from "@/src/modules/booking/repositories/category.repository";
import { createClient } from "@/src/infrastructure/supabase/server";
import { HistoryClient } from "./history-client";
import { Booking, Package, Category, Client } from "@prisma/client";

export const revalidate = 0;

import { enforceAdminRole } from "@/src/modules/auth/services/auth.service";
import { AdminRole } from "@prisma/client";

export default async function AdminHistoryPage() {
  const admin = await enforceAdminRole([AdminRole.SUPER_ADMIN, AdminRole.ADMIN_PESANAN]);

  const bookingRepository = new BookingRepository();
  const packageRepository = new PackageRepository();
  const categoryRepository = new CategoryRepository();

  const [rawBookings, packages, categories] = await Promise.all([
    bookingRepository.findHistoryBookings(),
    packageRepository.findAll(),
    categoryRepository.findAll(),
  ]);

  // Create a mapping of package name (lowercase) -> category label
  const packageCategoryMap = new Map<string, string>();
  (packages as Array<Package & { category: Category }>).forEach((pkg) => {
    packageCategoryMap.set(pkg.name.toLowerCase(), pkg.category.label);
  });

  // Serialize dates and attach category info for Client Component safety
  const bookings = (rawBookings as Array<Booking & { client: Client }>).map((b) => {
    const categoryLabel = packageCategoryMap.get(b.packageType.toLowerCase()) || "Lainnya";
    return {
      id: b.id,
      clientId: b.clientId,
      client: {
        fullName: b.client.fullName,
        email: b.client.email,
        phoneNumber: b.client.phoneNumber,
        instagram: b.client.instagram,
      },
      packageType: b.packageType,
      categoryLabel,
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
    };
  });

  const categoryLabels = (categories as Array<Category>).map((c) => c.label);

  return (
    <SidebarProvider>
      <AdminSidebar variant="sidebar" />
      <SidebarInset className="flex flex-col min-h-screen bg-background text-foreground">
        <AdminHeader title="Manajemen Studio Seniman Kamera" />

        {/* Content Container */}
        <main className="flex-1 px-6 md:px-12 py-10 max-w-[1200px] mx-auto w-full">
          <HistoryClient initialBookings={bookings} categoryLabels={categoryLabels} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
