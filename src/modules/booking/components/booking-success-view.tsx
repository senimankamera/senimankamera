"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
}

interface BookingSuccessViewProps {
  booking: BookingData;
}

export function BookingSuccessView({ booking }: BookingSuccessViewProps) {
  const router = useRouter();

  const isTimeBased = !!booking.sessionStartTime;

  const waText = encodeURIComponent(
    `Halo Kak, saya sudah melakukan booking dan pembayaran DP untuk acara saya dengan ID: ${booking.id}.\n\nBerikut detail pesanan saya:\n- Klien: ${booking.client.fullName}\n- Instagram: ${booking.client.instagram || "-"}\n- Paket: Sesi ${booking.packageType}\n- Acara: ${booking.eventName || "-"}\n- Tanggal: ${new Date(booking.bookingDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}\n- Waktu: ${isTimeBased ? `${booking.sessionStartTime} – ${booking.sessionEndTime}` : booking.eventTime || "-"} WIB\n\nMohon dibantu untuk proses konfirmasi booking. Terima kasih.`
  );
  const waUrl = `https://wa.me/6285721598190?text=${waText}`;

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
    <div className="w-full max-w-xl mx-auto px-6 py-12 border border-border/40 bg-card text-center flex flex-col items-center animate-[fadeIn_0.5s_ease-out]">
      <CheckCircle2 className="w-16 h-16 text-green-700 mb-6 stroke-1 animate-pulse" />
      <h2 className="font-serif text-3xl text-primary mb-3 font-medium">Pemesanan Berhasil</h2>
      
      <p className="font-sans text-xs text-secondary font-light mb-8 max-w-sm leading-relaxed">
        {statusConfig.description}
      </p>

      {/* Invoice Summary Card */}
      <div className="w-full border border-border/40 bg-muted/20 p-6 text-left mb-8 font-sans text-xs space-y-3">
        <div className="flex justify-between border-b border-border/20 pb-2.5">
          <span className="text-secondary font-semibold uppercase tracking-wider text-[10px]">Detail</span>
          <span className="text-primary font-bold">Sesi {booking.packageType}</span>
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
        <Button 
          onClick={() => window.open(waUrl, "_blank")}
          className="rounded-none font-sans text-[10px] uppercase tracking-widest py-6 text-white bg-primary hover:opacity-90 w-full flex items-center justify-center gap-2 cursor-pointer font-bold"
        >
          Hubungi via WhatsApp Owner Untuk Konfirmasi Manual
        </Button>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => router.push("/portfolio")}
            variant="outline"
            className="rounded-none font-sans text-[10px] uppercase tracking-widest py-4 border-border text-primary hover:bg-neutral-100 flex-1 cursor-pointer"
          >
            Lihat Portofolio
          </Button>
          <Button 
            onClick={() => router.push("/")}
            variant="ghost"
            className="rounded-none font-sans text-[10px] uppercase tracking-widest py-4 text-secondary hover:text-primary flex-1 cursor-pointer"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  );
}
