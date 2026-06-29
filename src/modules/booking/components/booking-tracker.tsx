"use client";

import { useState, useTransition } from "react";
import { Search, AlertCircle, CheckCircle2, Clock, Calendar, MapPin, User, Mail, ShieldCheck, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBookingByTrackingAction } from "../actions/get-booking-by-tracking.action";
import { BookingReceiptDownload } from "./booking-receipt-download";
import { cn } from "@/lib/utils";

interface BookingTrackerProps {
  initialBookingId?: string;
  initialEmail?: string;
}

export function BookingTracker({ initialBookingId = "", initialEmail = "" }: BookingTrackerProps) {
  const [bookingId, setBookingId] = useState(initialBookingId);
  const [email, setEmail] = useState(initialEmail);
  const [booking, setBooking] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!bookingId.trim() || !email.trim()) {
      setError("Silakan masukkan ID Pesanan dan Email Anda.");
      return;
    }

    startTransition(async () => {
      const res = await getBookingByTrackingAction({
        bookingId: bookingId.trim(),
        email: email.trim(),
      });

      if (res.success && res.data) {
        setBooking(res.data);
      } else {
        setBooking(null);
        setError(res.error || "Pesanan tidak ditemukan.");
      }
    });
  };

  const getTimelineSteps = (status: string) => {
    const isLunas = status === "LUNAS";
    const isApproved = status === "APPROVED" || isLunas;
    const isCancelled = status === "CANCELLED" || status === "REJECTED";

    return [
      {
        title: "DP Terbayar",
        description: "Pembayaran awal telah dikonfirmasi oleh DOKU",
        completed: !isCancelled,
        active: status === "PENDING",
      },
      {
        title: "Konfirmasi Admin",
        description: "Jadwal & teknis disetujui tim Seniman Kamera",
        completed: isApproved,
        active: status === "APPROVED",
      },
      {
        title: "Pelunasan Sisa",
        description: "Pelunasan tagihan sisa biaya diselesaikan",
        completed: isLunas,
        active: status === "APPROVED" && !isLunas,
      },
      {
        title: "Pelaksanaan Sesi",
        description: "Sesi foto / acara berlangsung sesuai jadwal",
        completed: isLunas,
        active: isLunas,
      },
      {
        title: "Proses Editing",
        description: "Foto & video dalam tahap kurasi dan editing studio",
        completed: isLunas,
        active: isLunas,
      },
      {
        title: "Selesai",
        description: "Seluruh karya foto & video hasil kurasi diserahkan",
        completed: isLunas,
        active: isLunas,
      },
    ];
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 font-sans">
      {/* Search Form Card */}
      <div className="border border-border/40 bg-card p-6 md:p-10 shadow-sm">
        <div className="mb-6 space-y-1">
          <h2 className="font-serif text-2xl md:text-3xl text-primary font-medium">Lacak Pesanan Anda</h2>
          <p className="text-xs text-secondary font-light">
            Masukkan Kode Tracking / Booking ID dan Alamat Email yang Anda gunakan saat pemesanan.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-800 dark:text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-primary text-[10px] block">
                Kode Tracking / Booking ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="Contoh: EGGLD-123456"
                  className="w-full pl-9 pr-4 py-3 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary font-mono text-xs"
                  required
                />
                <Search className="w-4 h-4 text-secondary/50 absolute left-3 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-primary text-[10px] block">
                Alamat Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@anda.com"
                  className="w-full pl-9 pr-4 py-3 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary text-xs"
                  required
                />
                <Mail className="w-4 h-4 text-secondary/50 absolute left-3 top-3.5" />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full md:w-auto uppercase tracking-widest py-6 px-8 rounded-none font-bold text-white bg-primary hover:opacity-90 cursor-pointer text-xs flex items-center justify-center gap-2 mt-2"
          >
            {isPending ? (
              <span>Memeriksa Data...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Cek Status Pesanan</span>
              </>
            )}
          </Button>
        </form>
      </div>

      {/* TRACKING RESULT SECTION */}
      {booking && (
        <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
          {/* Status Overview Card */}
          <div className="border border-border/40 bg-card p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/20 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-secondary font-bold block mb-1">
                  Detail Pesanan Ditemukan
                </span>
                <h3 className="font-serif text-xl text-primary font-medium">
                  {booking.categoryName ? `${booking.categoryName} - ` : ""}
                  {booking.packageType}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-secondary">Status saat ini:</span>
                <span className="px-3 py-1 border text-xs uppercase font-bold tracking-wider rounded-none bg-primary/5 border-primary/20 text-primary">
                  {booking.status}
                </span>
              </div>
            </div>

            {/* Visual Timeline Tracker */}
            <div className="py-4">
              <span className="text-[10px] uppercase tracking-widest text-secondary font-bold block mb-6">
                Progress Status Sesi Pemotretan
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative">
                {getTimelineSteps(booking.status).map((step, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "p-4 border text-left relative space-y-2 transition-all duration-300",
                      step.completed
                        ? "border-green-600/30 bg-green-50/30 dark:bg-green-950/10 text-primary"
                        : step.active
                        ? "border-amber-500 bg-amber-50/20 dark:bg-amber-950/10 text-primary font-semibold"
                        : "border-border/20 bg-muted/10 text-secondary/50 opacity-60"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                        Langkah 0{idx + 1}
                      </span>
                      {step.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : step.active ? (
                        <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-border/40" />
                      )}
                    </div>
                    <h4 className="text-xs font-bold font-serif">{step.title}</h4>
                    <p className="text-[11px] font-light leading-relaxed">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Details & Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column: Summary Info */}
            <div className="md:col-span-7 border border-border/40 bg-card p-6 md:p-8 space-y-4 text-xs">
              <h4 className="font-serif text-base text-primary font-medium border-b border-border/20 pb-2 mb-4">
                Ringkasan Informasi Booking
              </h4>

              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-border/10">
                <div>
                  <span className="text-secondary block text-[10px] uppercase font-bold">Klien</span>
                  <span className="text-primary font-semibold text-sm">{booking.client.fullName}</span>
                </div>
                <div>
                  <span className="text-secondary block text-[10px] uppercase font-bold">Instagram</span>
                  <span className="text-primary font-medium">{booking.client.instagram || "-"}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-border/10">
                <div>
                  <span className="text-secondary block text-[10px] uppercase font-bold">Tanggal Sesi</span>
                  <span className="text-primary font-semibold">
                    {new Date(booking.bookingDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-secondary block text-[10px] uppercase font-bold">Waktu Sesi</span>
                  <span className="text-primary font-medium">
                    {booking.sessionStartTime
                      ? `${booking.sessionStartTime} – ${booking.sessionEndTime} WIB`
                      : booking.eventTime || "-"}
                  </span>
                </div>
              </div>

              <div className="pb-3 border-b border-border/10">
                <span className="text-secondary block text-[10px] uppercase font-bold">Nama / Lokasi Acara</span>
                <span className="text-primary font-medium">
                  {booking.eventName || "-"} {booking.eventLocation ? `(${booking.eventLocation})` : ""}
                </span>
              </div>

              <div className="pt-2 flex justify-between items-center text-sm">
                <span className="text-secondary font-medium">Total Biaya Paket:</span>
                <span className="text-primary font-bold">
                  Rp {(booking.totalAmount || 0).toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm font-bold text-green-700 dark:text-green-400 pt-1">
                <span>DP Terbayar (via DOKU):</span>
                <span>Rp {(booking.dpAmount || 0).toLocaleString("id-ID")}</span>
              </div>
            </div>

            {/* Right Column: Download & Contact Actions */}
            <div className="md:col-span-5 border border-border/40 bg-card p-6 md:p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <h4 className="font-serif text-base text-primary font-medium border-b border-border/20 pb-2">
                  Aksi & Bukti Pembayaran
                </h4>

                <BookingReceiptDownload booking={booking} />
              </div>

              <div className="pt-4 border-t border-border/20">
                <Button
                  onClick={() => {
                    const waText = encodeURIComponent(
                      `Halo Seniman Kamera, saya ingin koordinasi terkait pesanan saya (ID: ${booking.id}) atas nama ${booking.client.fullName}.`
                    );
                    window.open(`https://wa.me/6285721598190?text=${waText}`, "_blank");
                  }}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-none font-sans text-[10px] uppercase tracking-widest py-5 flex items-center justify-center gap-2 cursor-pointer font-bold"
                >
                  Hubungi Admin via WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
