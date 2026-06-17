"use client";

import { useState } from "react";
import { 
  Search, 
  Calendar, 
  DollarSign, 
  Download, 
  FileSpreadsheet, 
  FileText,
  Clock, 
  CheckCircle, 
  XCircle,
  HelpCircle,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import * as XLSX from "xlsx";

interface Client {
  fullName: string;
  email: string;
  phoneNumber: string | null;
}

interface PaymentTransaction {
  id: string;
  type: string; // "DP" | "FULL"
  amount: number;
  createdAt: string;
}

interface Booking {
  id: string;
  client: Client;
  packageType: string;
  bookingDate: string; // ISO
  eventTime: string | null;
  eventName: string | null;
  eventLocation: string | null;
  notes: string | null;
  status: string;
  totalAmount: number;
  dpAmount: number;
  paymentTransactions: PaymentTransaction[];
  createdAt: string; // ISO
}

interface RecapClientProps {
  bookings: Booking[];
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function RecapClient({ bookings }: RecapClientProps) {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<string>("this-month");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(new Date(dateStr));
  };

  // Filter Logic
  const isDateInRange = (bookingDateStr: string) => {
    const bookingDate = new Date(bookingDateStr);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (dateRange === "today") {
      return bookingDate >= startOfToday && bookingDate <= endOfToday;
    }
    if (dateRange === "yesterday") {
      const startOfYesterday = new Date(startOfToday);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      const endOfYesterday = new Date(endOfToday);
      endOfYesterday.setDate(endOfYesterday.getDate() - 1);
      return bookingDate >= startOfYesterday && bookingDate <= endOfYesterday;
    }
    if (dateRange === "7-days") {
      const sevenDaysAgo = new Date(startOfToday);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return bookingDate >= sevenDaysAgo && bookingDate <= endOfToday;
    }
    if (dateRange === "30-days") {
      const thirtyDaysAgo = new Date(startOfToday);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return bookingDate >= thirtyDaysAgo && bookingDate <= endOfToday;
    }
    if (dateRange === "this-month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return bookingDate >= startOfMonth && bookingDate <= endOfMonth;
    }
    if (dateRange === "this-year") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return bookingDate >= startOfYear && bookingDate <= endOfYear;
    }
    if (dateRange === "custom") {
      if (!customStart && !customEnd) return true;
      const start = customStart ? new Date(customStart) : new Date(0);
      const end = customEnd ? new Date(new Date(customEnd).setHours(23, 59, 59, 999)) : new Date(8640000000000000);
      return bookingDate >= start && bookingDate <= end;
    }
    return true; // all
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.client.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (booking.eventName && booking.eventName.toLowerCase().includes(search.toLowerCase())) ||
      booking.packageType.toLowerCase().includes(search.toLowerCase());

    return matchesSearch && isDateInRange(booking.bookingDate);
  });

  // Calculate Metrics from Filtered Bookings
  let totalBookings = filteredBookings.length;
  let pendingCount = 0;
  let approvedCount = 0;
  let lunasCount = 0;
  let cancelledCount = 0;
  let totalDP = 0;
  let totalFull = 0;

  filteredBookings.forEach((b) => {
    const statusUpper = b.status.toUpperCase();
    if (statusUpper === "PENDING" || statusUpper === "PENDINGAPPROVAL") pendingCount++;
    else if (statusUpper === "APPROVED") approvedCount++;
    else if (statusUpper === "LUNAS" || statusUpper === "PAID" || statusUpper === "COMPLETED") lunasCount++;
    else if (statusUpper === "CANCELLED") cancelledCount++;

    // Sum transactions related to this booking
    b.paymentTransactions.forEach((t) => {
      if (t.type === "DP") {
        totalDP += t.amount;
      } else if (t.type === "FULL") {
        totalFull += t.amount;
      }
    });
  });

  const totalRevenue = totalDP + totalFull;

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
      case "PENDINGAPPROVAL":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200 uppercase text-[9px] py-1 px-2 rounded-none font-bold">Pending</Badge>;
      case "APPROVED":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 uppercase text-[9px] py-1 px-2 rounded-none font-bold">Approved</Badge>;
      case "REJECTED":
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200 uppercase text-[9px] py-1 px-2 rounded-none font-bold">Rejected</Badge>;
      case "CANCELLED":
        return <Badge className="bg-neutral-100 text-neutral-800 border-neutral-200 uppercase text-[9px] py-1 px-2 rounded-none font-bold">Cancelled</Badge>;
      case "LUNAS":
      case "PAID":
      case "COMPLETED":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 uppercase text-[9px] py-1 px-2 rounded-none font-bold">Lunas</Badge>;
      default:
        return <Badge className="uppercase text-[9px] py-1 px-2 rounded-none font-bold">{status}</Badge>;
    }
  };

  const handleExportExcel = () => {
    const dataToExport = filteredBookings.map((b) => {
      const dpAmount = b.paymentTransactions.find((t) => t.type === "DP")?.amount || 0;
      const fullAmount = b.paymentTransactions.find((t) => t.type === "FULL")?.amount || 0;
      return {
        "Booking ID": b.id.substring(0, 8),
        "Nama Client": b.client.fullName,
        "Email Client": b.client.email,
        "No Handphone": b.client.phoneNumber || "-",
        "Paket / Event": b.packageType,
        "Nama Event": b.eventName || "-",
        "Tanggal Booking": formatDate(b.bookingDate),
        "Status": b.status,
        "Pembayaran DP (20%)": dpAmount,
        "Pelunasan FULL (80%)": fullAmount,
        "Total Pendapatan": dpAmount + fullAmount,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Keuangan");
    XLSX.writeFile(workbook, `Rekap_Keuangan_${dateRange}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleExportCSV = () => {
    const headers = [
      "Booking ID", 
      "Nama Client", 
      "Email Client", 
      "No Handphone", 
      "Paket / Event", 
      "Nama Event", 
      "Tanggal Booking", 
      "Status", 
      "Pembayaran DP (20%)", 
      "Pelunasan FULL (80%)", 
      "Total Pendapatan"
    ];
    const rows = filteredBookings.map((b) => {
      const dpAmount = b.paymentTransactions.find((t) => t.type === "DP")?.amount || 0;
      const fullAmount = b.paymentTransactions.find((t) => t.type === "FULL")?.amount || 0;
      return [
        b.id.substring(0, 8),
        `"${b.client.fullName.replace(/"/g, '""')}"`,
        b.client.email,
        b.client.phoneNumber || "-",
        `"${b.packageType.replace(/"/g, '""')}"`,
        `"${(b.eventName || "-").replace(/"/g, '""')}"`,
        formatDate(b.bookingDate),
        b.status,
        dpAmount,
        fullAmount,
        dpAmount + fullAmount
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_Keuangan_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-primary font-medium">Rekap Pesanan & Pendapatan</h2>
          <p className="font-sans text-xs text-secondary font-light mt-1">Laporan rekapitulasi data pesanan studio foto dan history pembayaran.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleExportExcel}
            variant="outline" 
            className="rounded-none border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs gap-1.5 py-4"
          >
            <FileSpreadsheet className="w-4.5 h-4.5" /> Export Excel
          </Button>
          <Button 
            onClick={handleExportCSV}
            variant="outline" 
            className="rounded-none text-secondary hover:text-primary text-xs gap-1.5 py-4"
          >
            <Download className="w-4.5 h-4.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Options */}
      <Card className="rounded-none border-border/40 shadow-none">
        <CardContent className="p-5 flex flex-col lg:flex-row gap-5 items-end">
          {/* Search bar */}
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider font-bold text-secondary">Cari Pesanan</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
              <Input
                placeholder="Cari nama klien, acara, paket..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-none border-border/40 text-xs py-5"
              />
            </div>
          </div>

          {/* Date range filter */}
          <div className="w-full lg:w-[200px] space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider font-bold text-secondary">Rentang Waktu</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full border border-border/40 px-3 py-2.5 text-xs bg-background text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="yesterday">Kemarin</option>
              <option value="7-days">7 Hari Terakhir</option>
              <option value="30-days">30 Hari Terakhir</option>
              <option value="this-month">Bulan Ini</option>
              <option value="this-year">Tahun Ini</option>
              <option value="custom">Pilih Kustom</option>
            </select>
          </div>

          {/* Custom Date Inputs (only if "custom" is selected) */}
          {dateRange === "custom" && (
            <div className="flex gap-2 w-full lg:w-auto">
              <div className="w-full lg:w-[140px] space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-secondary">Mulai</label>
                <Input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="rounded-none border-border/40 text-xs py-4.5"
                />
              </div>
              <div className="w-full lg:w-[140px] space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-secondary">Selesai</label>
                <Input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="rounded-none border-border/40 text-xs py-4.5"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-none border-border/40 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase tracking-wider font-bold text-secondary">Total Pendapatan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-serif text-3xl font-semibold text-primary">{formatRupiah(totalRevenue)}</div>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Total Real Terbayar
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border/40 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase tracking-wider font-bold text-secondary">Total Pesanan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-serif text-3xl font-semibold text-primary">{totalBookings}</div>
            <div className="text-[10px] text-secondary font-semibold uppercase tracking-wider mt-1.5 flex gap-2">
              <span className="text-amber-700">{pendingCount} pending</span>
              <span>·</span>
              <span className="text-emerald-700">{approvedCount} approved</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border/40 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase tracking-wider font-bold text-secondary">Status Lunas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-serif text-3xl font-semibold text-blue-700">{lunasCount}</div>
            <p className="text-[10px] text-secondary uppercase tracking-wider mt-1.5">
              Pesanan selesai bayar penuh
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border/40 shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] uppercase tracking-wider font-bold text-secondary">Dibatalkan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-serif text-3xl font-semibold text-red-700">{cancelledCount}</div>
            <p className="text-[10px] text-secondary uppercase tracking-wider mt-1.5">
              Pesanan ditolak/dibatalkan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Report Table */}
      <Card className="rounded-none border-border/40 shadow-none overflow-hidden">
        <CardHeader className="py-5 bg-neutral-50 dark:bg-neutral-900 border-b border-border/40">
          <CardTitle className="font-serif text-lg font-medium text-primary">Detail Rekap Transaksi</CardTitle>
          <CardDescription className="font-sans text-xs">Menampilkan histori pesanan beserta rincian pelunasan.</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-neutral-50 dark:bg-neutral-900 font-sans text-[10px] uppercase tracking-widest text-secondary font-bold">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Tanggal</th>
                <th className="py-4 px-6">Klien</th>
                <th className="py-4 px-6">Paket / Event</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">DP (20%)</th>
                <th className="py-4 px-6">Pelunasan (80%)</th>
                <th className="py-4 px-6 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 font-sans text-xs">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-secondary/60 italic bg-background">
                    Tidak ada transaksi pada periode ini.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const dpTx = b.paymentTransactions.find((t) => t.type === "DP")?.amount || 0;
                  const fullTx = b.paymentTransactions.find((t) => t.type === "FULL")?.amount || 0;
                  return (
                    <tr key={b.id} className="hover:bg-muted/5 transition-colors">
                      <td className="py-4 px-6 font-mono text-[10px] text-secondary">
                        #{b.id.substring(0, 8)}
                      </td>
                      <td className="py-4 px-6 text-primary">
                        {formatDate(b.bookingDate)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-primary">{b.client.fullName}</div>
                        <div className="text-[10px] text-secondary mt-0.5">{b.client.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-primary">{b.packageType}</div>
                        <div className="text-[10px] text-secondary mt-0.5">{b.eventName || "-"}</div>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(b.status)}
                      </td>
                      <td className="py-4 px-6 font-mono text-secondary">
                        {dpTx > 0 ? formatRupiah(dpTx) : <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="py-4 px-6 font-mono text-secondary">
                        {fullTx > 0 ? formatRupiah(fullTx) : <span className="text-muted-foreground">-</span>}
                      </td>
                      <td className="py-4 px-6 text-right font-semibold font-mono text-primary">
                        {formatRupiah(dpTx + fullTx)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Revenue Breakdown */}
      <Card className="rounded-none border-border/40 shadow-none max-w-md ml-auto">
        <CardHeader className="py-4 bg-muted/20 border-b border-border/30">
          <CardTitle className="font-serif text-sm font-semibold uppercase tracking-wider text-secondary">Rincian Pendapatan Terhitung</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3 font-sans text-xs">
          <div className="flex justify-between items-center text-secondary">
            <span>Total DP (20%) Masuk</span>
            <span className="font-mono font-medium">{formatRupiah(totalDP)}</span>
          </div>
          <div className="flex justify-between items-center text-secondary">
            <span>Total Pelunasan (80%) Masuk</span>
            <span className="font-mono font-medium">{formatRupiah(totalFull)}</span>
          </div>
          <div className="border-t border-border/30 pt-3 flex justify-between items-center text-primary font-bold text-sm">
            <span>Total Real Revenue</span>
            <span className="font-mono">{formatRupiah(totalRevenue)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
