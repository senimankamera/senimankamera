"use client";

import { useState, useTransition } from "react";
import { 
  Search, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  FileText, 
  Check, 
  X, 
  CalendarDays, 
  CheckCircle2, 
  ChevronRight, 
  AlertCircle,
  HelpCircle,
  Eye,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateBookingStatusAction } from "@/src/modules/booking/actions/update-booking-status.action";
import { rescheduleBookingAction } from "@/src/modules/booking/actions/reschedule-booking.action";
import { toast } from "sonner";

interface Client {
  fullName: string;
  email: string;
  phoneNumber: string | null;
}

interface Booking {
  id: string;
  clientId: string;
  client: Client;
  packageType: string;
  bookingDate: string; // ISO
  eventTime: string | null;
  eventName: string | null;
  eventLocation: string | null;
  notes: string | null;
  status: string;
  source: string;
  sessionStartTime: string | null;
  sessionEndTime: string | null;
  createdAt: string; // ISO
  dpAmount: number | null;
  totalAmount: number | null;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface BookingsClientProps {
  initialBookings: Booking[];
  initialStatusFilter?: string;
}

export function BookingsClient({ initialBookings, initialStatusFilter }: BookingsClientProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter || "all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [isPending, startTransition] = useTransition();

  // Extract unique years from booking dates
  const uniqueYears = Array.from(
    new Set(
      bookings.map((b) => new Date(b.bookingDate).getFullYear().toString())
    )
  ).sort((a, b) => b.localeCompare(a));

  const months = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  // Filtering Logic
  const filteredBookings = bookings.filter((booking) => {
    const bDate = new Date(booking.bookingDate);
    const bMonth = (bDate.getMonth() + 1).toString();
    const bYear = bDate.getFullYear().toString();

    const matchesSearch = 
      booking.client.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (booking.eventName && booking.eventName.toLowerCase().includes(search.toLowerCase())) ||
      (booking.client.phoneNumber && booking.client.phoneNumber.includes(search)) ||
      booking.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesMonth = monthFilter === "all" || bMonth === monthFilter;
    const matchesYear = yearFilter === "all" || bYear === yearFilter;

    return matchesSearch && matchesStatus && matchesMonth && matchesYear;
  });

  const handleStatusUpdate = async (id: string, status: string) => {
    if (!confirm(`Apakah Anda yakin ingin mengubah status booking ini menjadi ${status}?`)) {
      return;
    }

    startTransition(async () => {
      const res = await updateBookingStatusAction(id, status);
      if (res.success && res.data) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: res.data.status } : b))
        );
        // Sync selected details view if open
        if (selectedBooking?.id === id) {
          setSelectedBooking((prev) => (prev ? { ...prev, status: res.data.status } : null));
        }
        toast.success(`Booking berhasil diubah menjadi ${status}`);
      } else {
        toast.error(res.error || "Gagal memperbarui status booking");
      }
    });
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !newDate) return;

    startTransition(async () => {
      const isTimeBased = selectedBooking.sessionStartTime !== null;
      const res = await rescheduleBookingAction(
        selectedBooking.id, 
        newDate, 
        isTimeBased ? rescheduleTime : undefined
      );
      if (res.success && res.data) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === selectedBooking.id
              ? { 
                  ...b, 
                  bookingDate: res.data.bookingDate,
                  sessionStartTime: res.data.sessionStartTime,
                  sessionEndTime: res.data.sessionEndTime,
                  eventTime: res.data.eventTime
                }
              : b
          )
        );
        setIsRescheduleOpen(false);
        setNewDate("");
        setRescheduleTime("");
        toast.success("Reschedule berhasil!");
        if (selectedBooking) {
          setSelectedBooking({ 
            ...selectedBooking, 
            bookingDate: res.data.bookingDate,
            sessionStartTime: res.data.sessionStartTime,
            sessionEndTime: res.data.sessionEndTime,
            eventTime: res.data.eventTime
          });
        }
      } else {
        toast.error(res.error || "Gagal menjadwal ulang");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
      case "PENDINGAPPROVAL":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30 uppercase text-[9px] tracking-wider py-1 px-2.5 rounded-none font-bold">Pending</Badge>;
      case "APPROVED":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 uppercase text-[9px] tracking-wider py-1 px-2.5 rounded-none font-bold">Approved</Badge>;
      case "REJECTED":
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30 uppercase text-[9px] tracking-wider py-1 px-2.5 rounded-none font-bold">Rejected</Badge>;
      case "CANCELLED":
        return <Badge className="bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-950/20 dark:text-neutral-400 dark:border-neutral-900/30 uppercase text-[9px] tracking-wider py-1 px-2.5 rounded-none font-bold">Cancelled</Badge>;
      case "LUNAS":
      case "PAID":
      case "COMPLETED":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30 uppercase text-[9px] tracking-wider py-1 px-2.5 rounded-none font-bold">Lunas</Badge>;
      case "MANUALBOOKING":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30 uppercase text-[9px] tracking-wider py-1 px-2.5 rounded-none font-bold">Manual</Badge>;
      default:
        return <Badge className="uppercase text-[9px] tracking-wider py-1 px-2.5 rounded-none font-bold">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(new Date(dateStr));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-primary font-medium">Manajemen Booking</h2>
          <p className="font-sans text-xs text-secondary font-light mt-1">Kelola dan review semua permohonan tanggal booking client.</p>
        </div>
      </div>

      {/* Filter Card */}
      <Card className="rounded-none border-border/40 shadow-none">
        <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-end">
          {/* Search */}
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider font-bold text-secondary">Cari Booking</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
              <Input
                placeholder="Cari nama pemesan, nama acara, WhatsApp..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-none border-border/40 text-xs py-5"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-[160px] space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider font-bold text-secondary">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-border/40 px-3 py-2.5 text-xs bg-background text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="PENDING">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="LUNAS">Lunas</option>
            </select>
          </div>

          {/* Month Filter */}
          <div className="w-full md:w-[150px] space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider font-bold text-secondary">Bulan</label>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full border border-border/40 px-3 py-2.5 text-xs bg-background text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Bulan</option>
              {months.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="w-full md:w-[120px] space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider font-bold text-secondary">Tahun</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full border border-border/40 px-3 py-2.5 text-xs bg-background text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Tahun</option>
              {uniqueYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="rounded-none border-border/40 shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-neutral-50 dark:bg-neutral-900 font-sans text-[10px] uppercase tracking-widest text-secondary font-bold">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Pemesan</th>
                <th className="py-4 px-6">Detail Acara</th>
                <th className="py-4 px-6">Jadwal</th>
                <th className="py-4 px-6">Pembayaran</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 font-sans text-xs">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-secondary/60 italic">
                    Tidak ada data booking yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-5 px-6 font-mono text-[10px] text-secondary">
                      #{booking.id.substring(0, 8)}
                    </td>
                    <td className="py-5 px-6">
                      <div className="font-semibold text-primary">{booking.client.fullName}</div>
                      <div className="text-[10px] text-secondary mt-0.5">{booking.client.email}</div>
                      {booking.client.phoneNumber && (
                        <div className="text-[10px] text-secondary mt-0.5">{booking.client.phoneNumber}</div>
                      )}
                    </td>
                    <td className="py-5 px-6">
                      <div className="font-semibold text-primary">{booking.eventName || "Dokumentasi"}</div>
                      <div className="text-[10px] text-secondary uppercase tracking-wider mt-0.5">{booking.packageType}</div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="font-semibold text-primary">{formatDate(booking.bookingDate)}</div>
                      {booking.sessionStartTime ? (
                        <div className="text-[10px] text-secondary flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-secondary/60" /> {booking.sessionStartTime} – {booking.sessionEndTime} WIB
                        </div>
                      ) : booking.eventTime ? (
                        <div className="text-[10px] text-secondary flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-secondary/60" /> {booking.eventTime} WIB
                        </div>
                      ) : null}
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-500">
                            DP: {formatRupiah(booking.dpAmount ?? 0)}
                          </span>
                          <span className={`text-[9px] uppercase px-1.5 py-0.5 font-semibold font-mono tracking-wider border rounded-none scale-95 origin-left ${booking.sessionStartTime ? 'border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' : 'border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30'}`}>
                            {booking.sessionStartTime ? "Time" : "Date"}
                          </span>
                        </div>
                        <div className="text-[10px] text-secondary font-medium">
                          Sisa: {formatRupiah((booking.totalAmount ?? 0) - (booking.dpAmount ?? 0))}
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="py-5 px-6 text-right space-x-1 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setIsDetailOpen(true);
                        }}
                        className="h-8 w-8 text-secondary hover:text-primary"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      {booking.status === "PENDING" && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleStatusUpdate(booking.id, "APPROVED")}
                            className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-100"
                            title="Setujui Booking"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleStatusUpdate(booking.id, "REJECTED")}
                            className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100"
                            title="Tolak Booking"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}

                      {booking.status === "APPROVED" && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleStatusUpdate(booking.id, "LUNAS")}
                            className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-100"
                            title="Tandai Lunas"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleStatusUpdate(booking.id, "CANCELLED")}
                            className="h-8 w-8 text-neutral-500 hover:text-neutral-600 hover:bg-neutral-50 border-neutral-200"
                            title="Batalkan Booking"
                          >
                            <AlertCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setIsRescheduleOpen(true);
                          setNewDate(new Date(booking.bookingDate).toISOString().split("T")[0]);
                          setRescheduleTime(booking.sessionStartTime || "");
                        }}
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-100"
                        title="Reschedule"
                      >
                        <CalendarDays className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* DETAIL MODAL (SIDE SHEET DIALOG INTERAKTIF) */}
      {isDetailOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-background w-full max-w-lg h-full p-8 overflow-y-auto flex flex-col space-y-6 shadow-2xl animate-in slide-in-from-right duration-300 rounded-none border-l border-border/40">
            <div className="flex items-center justify-between border-b border-border/20 pb-4">
              <div>
                <h3 className="font-serif text-xl text-primary font-medium">Detail Booking</h3>
                <span className="font-mono text-[10px] text-secondary">#{selectedBooking.id}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDetailOpen(false)}
                className="h-8 w-8 rounded-none border-border"
              >
                <X className="w-4.5 h-4.5" />
              </Button>
            </div>

            <div className="space-y-6 flex-1">
              {/* Status Section */}
              <div className="flex justify-between items-center bg-muted/20 p-4 border border-border/30">
                <span className="font-sans text-[10px] uppercase tracking-wider font-bold text-secondary">Status Sekarang</span>
                <div>{getStatusBadge(selectedBooking.status)}</div>
              </div>

              {/* Pemesan */}
              <div className="space-y-3">
                <h4 className="font-serif text-xs uppercase tracking-widest text-primary font-semibold border-b border-border/10 pb-1.5">
                  Informasi Pemesan
                </h4>
                <div className="space-y-2 font-sans text-xs text-secondary">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-secondary/60" />
                    <span className="font-bold text-primary">{selectedBooking.client.fullName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-secondary/60" />
                    <span>{selectedBooking.client.email}</span>
                  </div>
                  {selectedBooking.client.phoneNumber && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-secondary/60" />
                      <span>{selectedBooking.client.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Acara */}
              <div className="space-y-3">
                <h4 className="font-serif text-xs uppercase tracking-widest text-primary font-semibold border-b border-border/10 pb-1.5">
                  Informasi Acara
                </h4>
                <div className="space-y-2.5 font-sans text-xs text-secondary">
                  <div>
                    <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block mb-0.5">Nama Acara</span>
                    <span className="text-primary font-medium">{selectedBooking.eventName || "-"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block mb-0.5">Lokasi Acara</span>
                    <div className="flex items-center gap-1.5 text-primary font-medium">
                      <MapPin className="w-3.5 h-3.5 text-secondary/60" /> {selectedBooking.eventLocation || "-"}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block mb-0.5">Catatan Tambahan</span>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-border/30 rounded-none italic font-light">
                      {selectedBooking.notes || "Tidak ada catatan."}
                    </div>
                  </div>
                </div>
              </div>

              {/* Paket & Jadwal */}
              <div className="space-y-3">
                <h4 className="font-serif text-xs uppercase tracking-widest text-primary font-semibold border-b border-border/10 pb-1.5">
                  Jadwal & Paket Sesi
                </h4>
                <div className="grid grid-cols-2 gap-4 font-sans text-xs">
                  <div>
                    <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block mb-0.5">Paket Layanan</span>
                    <span className="text-primary font-bold">{selectedBooking.packageType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block mb-0.5">Sumber Pesanan</span>
                    <span className="text-primary capitalize">{selectedBooking.source}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block mb-0.5">Waktu Rencana</span>
                    <div className="text-primary font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-secondary/60" /> {formatDate(selectedBooking.bookingDate)}
                    </div>
                    {selectedBooking.sessionStartTime ? (
                      <div className="text-primary font-medium flex items-center gap-1.5 mt-1">
                        <Clock className="w-3.5 h-3.5 text-secondary/60" /> Sesi: {selectedBooking.sessionStartTime} – {selectedBooking.sessionEndTime} WIB
                      </div>
                    ) : selectedBooking.eventTime ? (
                      <div className="text-primary font-medium flex items-center gap-1.5 mt-1">
                        <Clock className="w-3.5 h-3.5 text-secondary/60" /> Jam {selectedBooking.eventTime} WIB
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Informasi Pembayaran */}
              <div className="space-y-3">
                <h4 className="font-serif text-xs uppercase tracking-widest text-primary font-semibold border-b border-border/10 pb-1.5">
                  Informasi Pembayaran
                </h4>
                <div className="grid grid-cols-2 gap-4 font-sans text-xs">
                  <div>
                    <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block mb-0.5">Tipe Booking</span>
                    <div>
                      <Badge variant="outline" className={`text-[9px] uppercase px-1.5 py-0.5 font-semibold font-mono tracking-wider rounded-none ${selectedBooking.sessionStartTime ? 'border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' : 'border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30'}`}>
                        {selectedBooking.sessionStartTime ? "TIME_BASED" : "DATE_ONLY"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block mb-0.5">Harga Paket</span>
                    <span className="text-primary font-bold">{formatRupiah(selectedBooking.totalAmount ?? 0)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block mb-0.5">Down Payment (DP)</span>
                    <span className="text-emerald-600 dark:text-emerald-500 font-bold">{formatRupiah(selectedBooking.dpAmount ?? 0)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block mb-0.5">Sisa Pelunasan</span>
                    <span className="text-blue-600 dark:text-blue-500 font-bold">{formatRupiah((selectedBooking.totalAmount ?? 0) - (selectedBooking.dpAmount ?? 0))}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="border-t border-border/20 pt-6 flex flex-wrap gap-2 justify-end">
              {selectedBooking.status === "PENDING" && (
                <>
                  <Button
                    onClick={() => handleStatusUpdate(selectedBooking.id, "APPROVED")}
                    disabled={isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-none font-sans text-xs uppercase tracking-wider py-5"
                  >
                    Setujui
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate(selectedBooking.id, "REJECTED")}
                    disabled={isPending}
                    variant="outline"
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-none font-sans text-xs uppercase tracking-wider py-5"
                  >
                    Tolak
                  </Button>
                </>
              )}

              {selectedBooking.status === "APPROVED" && (
                <>
                  <Button
                    onClick={() => handleStatusUpdate(selectedBooking.id, "LUNAS")}
                    disabled={isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-none font-sans text-xs uppercase tracking-wider py-5"
                  >
                    Tandai Lunas
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate(selectedBooking.id, "CANCELLED")}
                    disabled={isPending}
                    variant="outline"
                    className="border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-none font-sans text-xs uppercase tracking-wider py-5"
                  >
                    Batalkan
                  </Button>
                </>
              )}

              <Button
                onClick={() => {
                  setIsDetailOpen(false);
                  setIsRescheduleOpen(true);
                  setNewDate(new Date(selectedBooking.bookingDate).toISOString().split("T")[0]);
                  setRescheduleTime(selectedBooking.sessionStartTime || "");
                }}
                variant="outline"
                className="rounded-none border-border font-sans text-xs uppercase tracking-wider py-5"
              >
                Reschedule
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE DIALOG */}
      {isRescheduleOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md rounded-none border-border/40 shadow-2xl bg-background text-foreground animate-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border/20 pb-4">
              <CardTitle className="font-serif text-lg text-primary font-medium">Reschedule Jadwal</CardTitle>
              <CardDescription className="font-sans text-xs">Pindahkan tanggal booking untuk client {selectedBooking.client.fullName}</CardDescription>
            </CardHeader>
            <form onSubmit={handleReschedule}>
              <CardContent className="py-6 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-secondary tracking-wider block">Tanggal Lama</span>
                  <div className="text-xs text-primary font-medium">{formatDate(selectedBooking.bookingDate)}</div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="rescheduleDate" className="text-[10px] uppercase font-bold text-secondary tracking-wider block">Tanggal Baru</label>
                  <Input
                    type="date"
                    id="rescheduleDate"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="rounded-none border-border/40 text-xs py-5"
                  />
                  {selectedBooking.sessionStartTime !== null && (
                    <div className="space-y-1.5 mt-4">
                      <label htmlFor="rescheduleTime" className="text-[10px] uppercase font-bold text-secondary tracking-wider block">Jam Sesi Baru</label>
                      <Input
                        type="time"
                        id="rescheduleTime"
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                        required
                        className="rounded-none border-border/40 text-xs py-5"
                      />
                    </div>
                  )}
                  <p className="text-[10px] text-secondary/70 italic flex items-center gap-1 mt-1">
                    <Info className="w-3.5 h-3.5" /> Tanggal baru akan dikunci dan tanggal lama akan dibebaskan kembali.
                  </p>
                </div>
              </CardContent>
              <div className="border-t border-border/20 px-6 py-4 flex justify-end gap-2 bg-neutral-50 dark:bg-neutral-900">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRescheduleOpen(false)}
                  className="rounded-none border-border font-sans text-xs uppercase tracking-wider py-4"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !newDate}
                  className="rounded-none font-sans text-xs uppercase tracking-wider py-4"
                >
                  {isPending ? "Memproses..." : "Reschedule"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
