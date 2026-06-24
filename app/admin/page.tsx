import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/src/infrastructure/supabase/server";
import {
  DollarSign,
  CalendarCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { BookingRepository } from "@/src/modules/booking/repositories/booking.repository";

export const revalidate = 0; // Ensure admin dashboard gets fresh database queries

function formatRupiah(amount: number): string {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    const formatted = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1);
    return `Rp ${formatted}jt`;
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusBadgeStyle(status: string) {
  switch (status.toUpperCase()) {
    case "APPROVED":
    case "MANUALBOOKING":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "PENDING":
    case "PENDINGAPPROVAL":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "REJECTED":
    case "CANCELLED":
      return "bg-red-50 text-red-700 border border-red-200";
    case "LUNAS":
    case "PAID":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    default:
      return "bg-muted text-secondary border border-border/30";
  }
}

function getStatusLabel(status: string) {
  switch (status.toUpperCase()) {
    case "PENDING":
    case "PENDINGAPPROVAL": return "Pending";
    case "APPROVED": return "Approved";
    case "MANUALBOOKING": return "Manual";
    case "REJECTED": return "Rejected";
    case "CANCELLED": return "Cancelled";
    case "LUNAS":
    case "PAID": return "Lunas";
    default: return status;
  }
}

import { getCurrentAdmin } from "@/src/modules/auth/services/auth.service";

export default async function AdminPage() {
  const admin = await getCurrentAdmin();

  const repository = new BookingRepository();

  // Fetch dashboard stats, recent bookings and upcoming schedule in parallel
  const [dashboardStats, recentBookings, upcomingSchedule] = await Promise.all([
    repository.getDashboardStats(),
    repository.findRecentBookings(10),
    repository.getUpcomingSchedule(5),
  ]);

  const {
    revenue,
    revenueMonth,
    revenueToday,
    totalBookings,
    pendingCount,
    approvedCount,
    lunasCount,
    cancelledCount,
    actionRequired,
  } = dashboardStats;

  const bookingRequests = recentBookings.map((req: any) => {
    const clientName = req.client.fullName;
    const initialLetter = clientName.charAt(0).toUpperCase() || "?";
    const dateFormatted = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(req.bookingDate);

    return {
      id: req.id,
      client: clientName,
      initialLetter,
      date: dateFormatted,
      type: req.packageType,
      status: req.status,
    };
  });

  const upcomingBookings = upcomingSchedule.map((req: any) => {
    const clientName = req.client.fullName;
    const initialLetter = clientName.charAt(0).toUpperCase() || "?";
    const dateFormatted = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(req.bookingDate);

    return {
      id: req.id,
      client: clientName,
      initialLetter,
      date: dateFormatted,
      time: req.eventTime || "12:00",
      event: req.eventName || req.packageType,
      status: req.status,
    };
  });

  return (
    <SidebarProvider>
      <AdminSidebar variant="sidebar" />
      <SidebarInset className="flex flex-col min-h-screen bg-background text-foreground">

        <AdminHeader title="Seniman Kamera Studio Management" />

        {/* Content Container */}
        <div className="flex-1 px-6 md:px-12 py-10 max-w-[1200px] mx-auto w-full space-y-16">

          {/* Welcome Header */}
          <div className="space-y-2">
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-medium">Dashboard</h2>
            <p className="font-sans text-sm text-secondary font-light">Welcome back. Here is your studio's pulse.</p>
          </div>

          {/* Bento Grid: Key Metrics */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Panel 1: Revenue */}
            <Card className="rounded-none border-border/40 relative overflow-hidden group shadow-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-sans text-xs uppercase tracking-widest text-secondary font-bold">
                  Revenue
                </CardTitle>
                <DollarSign className="w-4 h-4 text-secondary" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="font-serif text-4xl font-medium text-primary">
                  {revenue > 0 ? formatRupiah(revenue) : "Rp 0"}
                </div>
                <div className="flex flex-col gap-1 font-sans text-[10px] uppercase tracking-widest text-secondary font-semibold">
                  <div className="flex items-center gap-1">
                    <span>Bulan Ini:</span>
                    <span className="text-primary font-bold">{formatRupiah(revenueMonth)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Hari Ini:</span>
                    <span className="text-primary font-bold">{formatRupiah(revenueToday)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Panel 2: Booking Status */}
            <Card className="rounded-none border-border/40 relative overflow-hidden group shadow-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-sans text-xs uppercase tracking-widest text-secondary font-bold">
                  Status Booking
                </CardTitle>
                <CalendarCheck className="w-4 h-4 text-secondary" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="font-serif text-4xl font-medium text-primary">{totalBookings}</div>
                <div className="flex flex-wrap items-center gap-2 font-sans text-[10px] uppercase tracking-widest font-semibold text-secondary">
                  <span className="text-amber-700">{pendingCount} pending</span>
                  <span>·</span>
                  <span className="text-emerald-700">{approvedCount} approved</span>
                  <span>·</span>
                  <span className="text-blue-700">{lunasCount} lunas</span>
                  <span>·</span>
                  <span className="text-red-700">{cancelledCount} cancelled</span>
                </div>
              </CardContent>
            </Card>

            {/* Panel 3: Action Required — accented card */}
            <Link href="/admin/bookings?status=PENDING" className="block transition-transform hover:scale-[1.01]">
              <Card className={`rounded-none border-border/40 relative overflow-hidden group shadow-none cursor-pointer h-full ${actionRequired > 0 ? "bg-primary text-primary-foreground" : ""}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className={`font-sans text-xs uppercase tracking-widest font-bold ${actionRequired > 0 ? "text-primary-foreground/75" : "text-secondary"}`}>
                    Action Required
                  </CardTitle>
                  <AlertCircle className={`w-4 h-4 ${actionRequired > 0 ? "text-primary-foreground/75" : "text-secondary"}`} />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className={`font-serif text-4xl font-medium ${actionRequired > 0 ? "text-primary-foreground" : "text-primary"}`}>
                    {actionRequired}
                  </div>
                  <div className={`flex items-center gap-1 font-sans text-xs font-semibold ${actionRequired > 0 ? "text-primary-foreground/80" : "text-secondary"}`}>
                    {actionRequired > 0 ? (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{actionRequired} pesanan pending, butuh tindakan</span>
                      </>
                    ) : (
                      <span>Semua pesanan sudah ditangani ✓</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>

          </section>

          {/* Grid section for Upcoming Schedule and Recent Booking Requests */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Column 1: Upcoming Schedule */}
            <Card className="rounded-none border-border/40 shadow-none">
              <CardHeader className="flex flex-row items-center justify-between py-6">
                <div>
                  <CardTitle className="font-serif text-xl font-medium">Jadwal Terdekat (Upcoming)</CardTitle>
                  <CardDescription className="font-sans text-xs text-secondary font-light">Jadwal pemotretan terdekat yang disetujui/lunas</CardDescription>
                </div>
                <Link href="/admin/recap" className="font-sans text-xs uppercase tracking-widest font-bold text-primary hover:underline transition-colors flex items-center gap-1">
                  Lihat Rekap Pesanan <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardHeader>
              <CardContent className="p-0 border-t border-border/30">
                {upcomingBookings.length === 0 ? (
                  <div className="py-16 text-center">
                    <Calendar className="w-8 h-8 text-border mx-auto mb-3" />
                    <p className="font-sans text-sm text-secondary">Belum ada jadwal terdekat.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/20">
                    {upcomingBookings.map((req: any) => (
                      <div
                        key={req.id}
                        className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-neutral-200 flex items-center justify-center font-serif text-sm font-semibold rounded-full border border-border/30 shrink-0">
                            {req.initialLetter}
                          </div>
                          <div>
                            <h4 className="font-sans text-sm font-bold text-primary">{req.client}</h4>
                            <p className="font-sans text-xs text-secondary flex flex-wrap items-center gap-1.5 mt-0.5">
                              <Calendar className="w-3 h-3" /> {req.date} · <Clock className="w-3.5 h-3.5" /> {req.time}
                              {req.event && <> · {req.event}</>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-widest rounded-sm ${getStatusBadgeStyle(req.status)}`}>
                            {getStatusLabel(req.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Column 2: Recent Booking Requests */}
            <Card className="rounded-none border-border/40 shadow-none">
              <CardHeader className="flex flex-row items-center justify-between py-6">
                <div>
                  <CardTitle className="font-serif text-xl font-medium">Recent Booking Requests</CardTitle>
                  <CardDescription className="font-sans text-xs text-secondary font-light">Permintaan booking terbaru dari klien</CardDescription>
                </div>
                <Link href="/admin/bookings" className="font-sans text-xs uppercase tracking-widest font-bold text-secondary hover:text-primary transition-colors flex items-center gap-1">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardHeader>
              <CardContent className="p-0 border-t border-border/30">
                {bookingRequests.length === 0 ? (
                  <div className="py-16 text-center">
                    <Calendar className="w-8 h-8 text-border mx-auto mb-3" />
                    <p className="font-sans text-sm text-secondary">Belum ada pesanan masuk.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/20">
                    {bookingRequests.map((req: any) => (
                      <div
                        key={req.id}
                        className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-muted/10 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-neutral-200 flex items-center justify-center font-serif text-sm font-semibold rounded-full border border-border/30 shrink-0">
                            {req.initialLetter}
                          </div>
                          <div>
                            <h4 className="font-sans text-sm font-bold text-primary">{req.client}</h4>
                            <p className="font-sans text-xs text-secondary flex items-center gap-1.5 mt-0.5">
                              <Calendar className="w-3 h-3" /> {req.date}
                              {req.type && <> · {req.type}</>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-widest rounded-sm ${getStatusBadgeStyle(req.status)}`}>
                            {getStatusLabel(req.status)}
                          </span>
                          <Link href={`/admin/bookings`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
