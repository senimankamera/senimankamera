"use client";

import { useState } from "react";
import { CheckCircle2, Lock, Unlock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookingReceiptDownload } from "./booking-receipt-download";

interface ClientData {
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  instagram?: string | null;
}

interface BookingData {
  id: string;
  packageType: string;
  bookingDate: string | Date;
  eventTime?: string | null;
  eventName?: string | null;
  eventLocation?: string | null;
  status: string;
  dpAmount?: number | null;
  totalAmount?: number | null;
  sessionStartTime?: string | null;
  sessionEndTime?: string | null;
  client: ClientData;
  categoryName?: string | null;
}

interface BookingSuccessViewProps {
  booking: BookingData;
}

export function BookingSuccessView({ booking }: BookingSuccessViewProps) {
  const router = useRouter();
  const [hasClickedWa, setHasClickedWa] = useState(false);

  const isTimeBased = !!booking.sessionStartTime;

  const waText = encodeURIComponent(
    `Halo Kak, saya sudah melakukan booking dan pembayaran DP untuk acara saya dengan Kode Tracking: ${booking.id}.\n\nBerikut detail pesanan saya:\n- Klien: ${booking.client.fullName}\n- Instagram: ${booking.client.instagram || "-"}\n- Paket: ${booking.categoryName ? `${booking.categoryName} - ` : ""}${booking.packageType}\n- Acara: ${booking.eventName || "-"}\n- Tanggal: ${new Date(booking.bookingDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}\n- Waktu: ${isTimeBased ? `${booking.sessionStartTime} – ${booking.sessionEndTime}` : booking.eventTime || "-"} WIB\n\nMohon dibantu untuk proses konfirmasi booking. Terima kasih.`
  );
  const waUrl = `https://wa.me/6285721598190?text=${waText}`;

  const handleWaClick = () => {
    window.open(waUrl, "_blank");
    setHasClickedWa(true);
  };

  // Helper to determine status badge and helper text
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Menunggu Persetujuan",
          badgeClass: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400",
          description: "Pemesanan Anda telah tercatat. Silakan hubungi kami melalui WhatsApp untuk mempercepat proses konfirmasi booking."
        };
      case "APPROVED":
        return {
          label: "Disetujui",
          badgeClass: "text-green-700 bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400",
          description: "Pemesanan Anda telah disetujui oleh admin! Kami akan segera menghubungi Anda untuk koordinasi lebih lanjut."
        };
      case "LUNAS":
        return {
          label: "Lunas",
          badgeClass: "text-green-700 bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400",
          description: "Pembayaran Anda telah lunas. Terima kasih telah mempercayakan momen berharga Anda kepada kami."
        };
      case "CANCELLED":
        return {
          label: "Dibatalkan",
          badgeClass: "text-red-700 bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400",
          description: "Pemesanan ini telah dibatalkan. Silakan hubungi kami jika ada pertanyaan."
        };
      default:
        return {
          label: status,
          badgeClass: "text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-850 dark:border-gray-800 dark:text-gray-400",
          description: "Status pemesanan Anda saat ini adalah: " + status
        };
    }
  };

  const statusConfig = getStatusConfig(booking.status);

  return (
    <div className="w-full max-w-xl mx-auto px-6 py-12 border border-border/40 bg-card text-center flex flex-col items-center animate-[fadeIn_0.5s_ease-out] my-12">
      <CheckCircle2 className="w-16 h-16 text-green-700 mb-6 stroke-1 animate-pulse" />
      <h2 className="font-serif text-3xl text-primary mb-3 font-medium">Pemesanan Berhasil</h2>
      
      <p className="font-sans text-xs text-secondary font-light mb-8 max-w-sm leading-relaxed">
        {statusConfig.description}
      </p>

      {/* Alert Banner for Manual WhatsApp Confirmation */}
      {(booking.status === "PENDING" || booking.status === "APPROVED" || booking.status === "LUNAS") && (
        <div className="w-full mb-6 p-4 border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/30 text-red-800 dark:text-red-300 font-sans text-xs text-left leading-relaxed rounded-none flex items-start gap-2.5 animate-pulse">
          <span className="text-base shrink-0 leading-none">⚠️</span>
          <div>
            <span className="font-bold uppercase tracking-wider block mb-1 text-red-700 dark:text-red-400">Konfirmasi Manual (WAJIB)</span>
            Pembayaran Anda telah diterima. Anda <strong>WAJIB</strong> melakukan konfirmasi manual melalui WhatsApp untuk mengamankan slot jadwal pemotretan Anda. Silakan klik tombol merah <strong>"Hubungi via WhatsApp Owner (WAJIB)"</strong> di bawah untuk mengirim detail pemesanan ke admin.
          </div>
        </div>
      )}

      {/* Invoice Summary Card */}
      <div className="w-full border border-border/40 bg-muted/20 p-6 text-left mb-8 font-sans text-xs space-y-3">
        <div className="flex justify-between border-b border-border/20 pb-2.5">
          <span className="text-secondary font-semibold uppercase tracking-wider text-[10px]">Detail</span>
          <span className="text-primary font-bold">Sesi {booking.packageType}</span>
        </div>
        <div className="flex justify-between items-center bg-background p-2.5 border border-border/30">
          <span className="text-secondary font-bold uppercase tracking-wider text-[10px]">Kode Tracking:</span>
          <span className="text-primary font-mono font-bold text-sm bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 border border-amber-500/20">
            {booking.id}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-secondary">Status Pesanan:</span>
          <span className={`px-2 py-0.5 border text-[10px] uppercase font-bold tracking-wider rounded-none ${statusConfig.badgeClass}`}>
            {statusConfig.label}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-secondary">Nama Klien:</span>
          <span className="text-primary font-medium">{booking.client.fullName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-secondary">Instagram:</span>
          <span className="text-primary font-medium">{booking.client.instagram || "-"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-secondary">Nama Acara:</span>
          <span className="text-primary font-medium">{booking.eventName || "-"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-secondary">Tanggal Sesi:</span>
          <span className="text-primary font-medium">
            {new Date(booking.bookingDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-secondary">Waktu & Lokasi:</span>
          <span className="text-primary font-medium text-right max-w-[200px] truncate" title={booking.eventLocation || ""}>
            {isTimeBased
              ? `${booking.sessionStartTime} – ${booking.sessionEndTime}`
              : booking.eventTime || "-"}{" "}
            WIB - {isTimeBased ? "Studio" : booking.eventLocation || "-"}
          </span>
        </div>
        <div className="flex justify-between pt-2 border-t border-dashed border-border/30">
          <span className="text-secondary">Total Biaya:</span>
          <span className="text-primary font-medium">
            {"Rp. " + (booking.totalAmount || 0).toLocaleString("id-ID")}
          </span>
        </div>
        <div className="flex justify-between text-sm pt-2 font-bold text-primary border-t border-border/30">
          <span>
            {isTimeBased
              ? "Uang Muka (DP Flat):"
              : "Uang Muka (DP 20%):"}
          </span>
          <span>
            {"Rp. " + (booking.dpAmount || 0).toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <BookingReceiptDownload booking={booking} />
        <Button 
          onClick={handleWaClick}
          className={cn(
            "rounded-none font-sans text-[10px] uppercase tracking-widest py-6 text-white w-full flex items-center justify-center gap-2 cursor-pointer font-bold transition-all duration-300",
            (booking.status === "PENDING" || booking.status === "APPROVED" || booking.status === "LUNAS")
              ? "bg-red-600 hover:bg-red-700 shadow-lg animate-pulse"
              : "bg-primary hover:opacity-90"
          )}
        >
          Hubungi via WhatsApp Owner (WAJIB)
        </Button>

        {/* Locked / Unlocked Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Button 
            onClick={() => router.push("/portfolio")}
            disabled={!hasClickedWa}
            variant="outline"
            className={cn(
              "rounded-none font-sans text-[10px] uppercase tracking-widest py-5 border-border flex-1 flex items-center justify-center gap-2 transition-all duration-300 font-bold",
              hasClickedWa
                ? "border-primary text-primary hover:bg-neutral-100 cursor-pointer shadow-sm"
                : "opacity-50 cursor-not-allowed bg-muted/30 text-secondary"
            )}
            title={!hasClickedWa ? "Klik WhatsApp Konfirmasi untuk membuka kunci" : ""}
          >
            {!hasClickedWa ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-green-600" />}
            Lihat Portofolio
          </Button>

          <Button 
            onClick={() => router.push("/")}
            disabled={!hasClickedWa}
            variant={hasClickedWa ? "default" : "outline"}
            className={cn(
              "rounded-none font-sans text-[10px] uppercase tracking-widest py-5 flex-1 flex items-center justify-center gap-2 transition-all duration-300 font-bold",
              hasClickedWa
                ? "bg-primary text-white hover:opacity-90 cursor-pointer shadow-sm"
                : "opacity-50 cursor-not-allowed text-secondary bg-muted/20 border-border"
            )}
            title={!hasClickedWa ? "Klik WhatsApp Konfirmasi untuk membuka kunci" : ""}
          >
            {!hasClickedWa ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-green-400" />}
            Kembali ke Beranda
          </Button>
        </div>

        {!hasClickedWa && (
          <p className="font-sans text-[10px] text-secondary/70 italic mt-1">
            * Tombol navigasi di atas terkunci 🔒 dan akan terbuka otomatis setelah Anda mengklik tombol merah WhatsApp WAJIB.
          </p>
        )}
      </div>
    </div>
  );
}
