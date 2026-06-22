"use client";

import { useState, useTransition } from "react";
import { 
  Search, 
  Trash2, 
  Eye, 
  X, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { deleteBookingAction, deleteMultipleBookingsAction } from "@/src/modules/booking/actions/delete-bookings.action";
import { useModal } from "@/components/modal-provider";
import { toast } from "sonner";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

interface Client {
  fullName: string;
  email: string;
  phoneNumber: string | null;
  instagram: string | null;
}

interface Booking {
  id: string;
  clientId: string;
  client: Client;
  packageType: string;
  categoryLabel: string;
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

interface HistoryClientProps {
  initialBookings: Booking[];
  categoryLabels: string[];
}

export function HistoryClient({ initialBookings, categoryLabels }: HistoryClientProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Bulk delete states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");

  const [isPending, startTransition] = useTransition();
  const { confirm } = useModal();

  // Filtering Logic
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.client.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (booking.eventName && booking.eventName.toLowerCase().includes(search.toLowerCase())) ||
      (booking.client.phoneNumber && booking.client.phoneNumber.includes(search)) ||
      (booking.client.instagram && booking.client.instagram.toLowerCase().includes(search.toLowerCase())) ||
      booking.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || booking.categoryLabel === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sort by order date (createdAt) descending
  const sortedFilteredBookings = [...filteredBookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Checkbox handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const ids = new Set(sortedFilteredBookings.map((b) => b.id));
      setSelectedIds(ids);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSingleDelete = async (id: string) => {
    const isConfirmed = await confirm("Apakah Anda yakin ingin menghapus permanen riwayat pesanan ini?");
    if (!isConfirmed) return;

    startTransition(async () => {
      const res = await deleteBookingAction(id);
      if (res.success) {
        setBookings((prev) => prev.filter((b) => b.id !== id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        if (selectedBooking?.id === id) {
          setSelectedBooking(null);
          setIsDetailOpen(false);
        }
        toast.success("Riwayat pesanan berhasil dihapus.");
      } else {
        toast.error(res.error || "Gagal menghapus riwayat pesanan.");
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) {
      toast.warning("Silakan pilih setidaknya satu pesanan untuk dihapus.");
      return;
    }
    setConfirmInput("");
    setIsDeleteConfirmOpen(true);
  };

  const executeBulkDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmInput !== "Delete Selected") {
      toast.error("Konfirmasi kata kunci salah.");
      return;
    }

    startTransition(async () => {
      const idsArray = Array.from(selectedIds);
      const res = await deleteMultipleBookingsAction(idsArray);
      if (res.success) {
        setBookings((prev) => prev.filter((b) => !selectedIds.has(b.id)));
        setSelectedIds(new Set());
        setIsDeleteConfirmOpen(false);
        toast.success(`${res.count} riwayat pesanan berhasil dihapus.`);
      } else {
        toast.error(res.error || "Gagal menghapus beberapa riwayat.");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
      case "MANUALBOOKING":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 uppercase text-[9px] tracking-wider py-1 px-2.5 rounded-none font-bold">Approved</Badge>;
      case "REJECTED":
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30 uppercase text-[9px] tracking-wider py-1 px-2.5 rounded-none font-bold">Rejected</Badge>;
      case "CANCELLED":
        return <Badge className="bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-950/20 dark:text-neutral-400 dark:border-neutral-900/30 uppercase text-[9px] tracking-wider py-1 px-2.5 rounded-none font-bold">Cancelled</Badge>;
      case "LUNAS":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30 uppercase text-[9px] tracking-wider py-1 px-2.5 rounded-none font-bold">Lunas</Badge>;
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

  const formatDateTime = (dateStr: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(dateStr)) + " WIB";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-primary font-medium">Riwayat Pesanan</h2>
          <p className="font-sans text-xs text-secondary font-light mt-1">
            Daftar seluruh pesanan yang sudah diselesaikan (Lunas) atau Ditolak (Rejected).
          </p>
        </div>
        {selectedIds.size > 0 && (
          <Button
            onClick={handleBulkDelete}
            variant="destructive"
            className="rounded-none font-sans text-xs uppercase tracking-wider py-5 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Hapus Terpilih ({selectedIds.size})
          </Button>
        )}
      </div>

      {/* Filter Card */}
      <Card className="rounded-none border-border/40 shadow-none">
        <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-end">
          {/* Search */}
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider font-bold text-secondary">Cari Riwayat</label>
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

          {/* Category Filter */}
          <div className="w-full md:w-[200px] space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider font-bold text-secondary">Kategori Paket</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-border/40 px-3 py-2.5 text-xs bg-background text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {categoryLabels.map((label) => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-[180px] space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider font-bold text-secondary">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-border/40 px-3 py-2.5 text-xs bg-background text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Riwayat</option>
              <option value="LUNAS">Lunas</option>
              <option value="REJECTED">Rejected / Ditolak</option>
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
                <th className="py-4 px-6 w-[50px] text-center">
                  <input
                    type="checkbox"
                    checked={sortedFilteredBookings.length > 0 && selectedIds.size === sortedFilteredBookings.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4.5 h-4.5 accent-primary cursor-pointer align-middle"
                  />
                </th>
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Pemesan</th>
                <th className="py-4 px-6">Detail Acara</th>
                <th className="py-4 px-6">Kategori</th>
                <th className="py-4 px-6">Jadwal</th>
                <th className="py-4 px-6">Total Bayar</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 font-sans text-xs">
              {sortedFilteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-secondary/60 italic">
                    Tidak ada riwayat pesanan yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                sortedFilteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-5 px-6 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(booking.id)}
                        onChange={(e) => handleSelectRow(booking.id, e.target.checked)}
                        className="w-4.5 h-4.5 accent-primary cursor-pointer align-middle"
                      />
                    </td>
                    <td className="py-5 px-6 font-mono text-[10px] text-secondary">
                      #{booking.id.substring(0, 8)}
                    </td>
                    <td className="py-5 px-6">
                      <div className="font-semibold text-primary">{booking.client.fullName}</div>
                      <div className="text-[10px] text-secondary mt-0.5">{booking.client.email}</div>
                      {booking.client.phoneNumber && (
                        <div className="text-[10px] text-secondary mt-0.5">{booking.client.phoneNumber}</div>
                      )}
                      <div className="text-[9px] text-secondary/60 mt-1.5 font-semibold uppercase tracking-wider">
                        Order: {formatDateTime(booking.createdAt)}
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="font-semibold text-primary">{booking.eventName || "Dokumentasi"}</div>
                      <div className="text-[10px] text-secondary uppercase tracking-wider mt-0.5">{booking.packageType}</div>
                    </td>
                    <td className="py-5 px-6">
                      <span className="font-semibold text-primary">{booking.categoryLabel}</span>
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
                    <td className="py-5 px-6 font-semibold text-emerald-600 dark:text-emerald-500">
                      {formatRupiah(booking.totalAmount ?? 0)}
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSingleDelete(booking.id)}
                        disabled={isPending}
                        className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        title="Hapus Permanen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* DETAIL MODAL */}
      {isDetailOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm">
          <div className="bg-background w-full max-w-lg h-full p-8 overflow-y-auto flex flex-col space-y-6 shadow-2xl animate-in slide-in-from-right duration-300 rounded-none border-l border-border/40">
            <div className="flex items-center justify-between border-b border-border/20 pb-4">
              <div>
                <h3 className="font-serif text-xl text-primary font-medium">Detail Riwayat</h3>
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
                <span className="font-sans text-[10px] uppercase tracking-wider font-bold text-secondary">Status</span>
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
                  {selectedBooking.client.instagram && (
                    <div className="flex items-center gap-3">
                      <InstagramIcon className="w-4 h-4 text-secondary/60" />
                      <span>{selectedBooking.client.instagram}</span>
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
                  Jadwal & Kategori
                </h4>
                <div className="grid grid-cols-2 gap-4 font-sans text-xs">
                  <div>
                    <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block mb-0.5">Kategori</span>
                    <span className="text-primary font-bold">{selectedBooking.categoryLabel}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block mb-0.5">Paket Layanan</span>
                    <span className="text-primary font-bold">{selectedBooking.packageType}</span>
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
                    <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block mb-0.5">Harga Total</span>
                    <span className="text-primary font-bold">{formatRupiah(selectedBooking.totalAmount ?? 0)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block mb-0.5">DP yang Dibayar</span>
                    <span className="text-emerald-600 dark:text-emerald-500 font-bold">{formatRupiah(selectedBooking.dpAmount ?? 0)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-secondary font-semibold uppercase tracking-wider block mb-0.5">Pelunasan</span>
                    <span className="text-blue-600 dark:text-blue-500 font-bold">{formatRupiah((selectedBooking.totalAmount ?? 0) - (selectedBooking.dpAmount ?? 0))}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border/20 pt-6 flex justify-end">
              <Button
                onClick={() => handleSingleDelete(selectedBooking.id)}
                disabled={isPending}
                variant="destructive"
                className="rounded-none font-sans text-xs uppercase tracking-wider py-5"
              >
                Hapus Permanen
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* BULK DELETE CONFIRMATION DIALOG */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md rounded-none border-border/40 shadow-2xl bg-background text-foreground animate-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-border/20 pb-4">
              <CardTitle className="font-serif text-lg text-red-600 font-medium flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Hapus Masal Riwayat Pesanan
              </CardTitle>
              <CardDescription className="font-sans text-xs">
                Tindakan ini akan menghapus secara permanen {selectedIds.size} riwayat pesanan terpilih. Data tidak dapat dipulihkan!
              </CardDescription>
            </CardHeader>
            <form onSubmit={executeBulkDelete}>
              <CardContent className="py-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="deleteConfirmInput" className="text-xs font-semibold text-secondary">
                    Ketik <span className="font-bold text-red-600">Delete Selected</span> untuk mengonfirmasi tindakan ini:
                  </label>
                  <Input
                    type="text"
                    id="deleteConfirmInput"
                    placeholder='Ketik "Delete Selected" disini'
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    required
                    className="rounded-none border-border/40 text-xs py-5"
                    autoComplete="off"
                  />
                </div>
              </CardContent>
              <div className="border-t border-border/20 px-6 py-4 flex justify-end gap-2 bg-neutral-50 dark:bg-neutral-900">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="rounded-none border-border font-sans text-xs uppercase tracking-wider py-4"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || confirmInput !== "Delete Selected"}
                  variant="destructive"
                  className="rounded-none font-sans text-xs uppercase tracking-wider py-4"
                >
                  {isPending ? "Menghapus..." : "Hapus Permanen"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
