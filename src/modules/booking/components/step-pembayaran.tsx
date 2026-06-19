"use client";

import { CreditCard, Check, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepPembayaranProps {
  packageName: string;
  packagePrice: number;
  bookingDate: string;
  eventTime: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  instagram: string;
  eventName: string;
  eventLocation: string;
  notes: string;
  isPending: boolean;
  bookingType: string;
  onSubmit: () => void;
  onBack: () => void;
  isPayRetry?: boolean;
  onCancelPayment?: () => void;
}

export function StepPembayaran({
  packageName,
  packagePrice,
  bookingDate,
  eventTime,
  fullName,
  email,
  phoneNumber,
  instagram,
  eventName,
  eventLocation,
  notes,
  isPending,
  bookingType,
  onSubmit,
  onBack,
  isPayRetry,
  onCancelPayment,
}: StepPembayaranProps) {
  const isTimeBased = bookingType === "TIME_BASED";
  const dpAmount = isTimeBased ? 150000 : packagePrice * 0.2;

  const formattedDate = new Date(bookingDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });

  return (
    <div className="space-y-8">
      <div className="text-center max-w-md mx-auto">
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-secondary mb-2 block font-bold">
          Langkah 4 dari 5
        </span>
        <h2 className="font-serif text-2xl md:text-3xl text-primary mb-2 font-medium">Pembayaran Uang Muka (DP)</h2>
        <p className="font-sans text-xs text-secondary font-light leading-relaxed">
          Tinjau ringkasan pesanan Anda di bawah ini dan lakukan checkout untuk memproses pemesanan sesi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Ringkasan Pesanan */}
        <div className="md:col-span-7 border border-border/40 bg-card p-6 space-y-5 rounded-none font-sans text-xs">
          <h3 className="font-serif text-base text-primary font-medium border-b border-border/20 pb-3 uppercase tracking-wider text-xs">
            Ringkasan Pesanan
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between pb-1.5 border-b border-border/10">
              <span className="text-secondary font-semibold">Paket Layanan:</span>
              <span className="text-primary font-bold text-sm">{packageName}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-secondary">Nama Acara:</span>
              <span className="text-primary font-medium">{eventName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-secondary">Tanggal Acara:</span>
              <span className="text-primary font-medium">{formattedDate}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-secondary">Waktu Acara:</span>
              <span className="text-primary font-medium">{eventTime} WIB</span>
            </div>

            <div className="flex justify-between">
              <span className="text-secondary">Lokasi Acara:</span>
              <span className="text-primary font-medium text-right max-w-[200px] truncate" title={eventLocation}>
                {eventLocation}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-secondary">Nama Pemesan:</span>
              <span className="text-primary font-medium">{fullName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-secondary">Instagram:</span>
              <span className="text-primary font-medium">{instagram}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-secondary">No. WhatsApp / HP:</span>
              <span className="text-primary font-medium">{phoneNumber}</span>
            </div>

            {notes && (
              <div className="flex flex-col gap-1.5 pt-2.5 border-t border-dashed border-border/20">
                <span className="text-secondary font-semibold">Catatan Klien:</span>
                <p className="text-secondary/80 bg-muted/20 p-2 border border-border/15 italic rounded-none leading-relaxed max-h-[80px] overflow-y-auto">
                  "{notes}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Skema Pembayaran & Simulasinya */}
        <div className="md:col-span-5 space-y-6">
          <div className="border border-border/40 bg-card p-6 space-y-5 rounded-none font-sans text-xs">
            <h3 className="font-serif text-base text-primary font-medium border-b border-border/20 pb-3 uppercase tracking-wider text-xs">
              Skema Pembayaran
            </h3>

            <div className="space-y-4">
              <div className="p-4 border border-primary/50 bg-primary/5 flex flex-col gap-1 rounded-none relative">
                <div className="absolute top-3 right-3 bg-primary text-white p-0.5 rounded-none">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-primary">Opsi Pembayaran Terpilih</span>
                <span className="text-xs font-semibold text-primary">
                  {isTimeBased ? "Uang Muka (DP Flat)" : "Uang Muka (DP 20%)"}
                </span>
                <p className="text-[11px] text-secondary/70 leading-normal">
                  {isTimeBased
                    ? "Pembayaran DP flat Rp 150.000 dilakukan melalui website. Sisa pelunasan dibayarkan di luar website setelah sesi selesai."
                    : "Pembayaran DP 20% dilakukan melalui website. Pelunasan sisa 80% dibayarkan di luar website setelah sesi selesai."}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/20">
                <div className="flex justify-between text-secondary">
                  <span>Total Harga Paket:</span>
                  <span>{"Rp. " + packagePrice.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-primary border-t border-dashed border-border/25 pt-2">
                  <span>{isTimeBased ? "Uang Muka (DP):" : "Uang Muka (DP 20%):"}</span>
                  <span>{"Rp. " + dpAmount.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secure Payment Note */}
          <div className="p-4 bg-muted/20 border border-border/30 text-[11px] font-sans text-secondary flex items-start gap-2.5 leading-relaxed rounded-none">
            <ShieldCheck className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-primary mb-0.5">Sistem Booking Terjamin</span>
              Jadwal Anda akan langsung masuk ke database kami sebagai <span className="font-semibold text-yellow-600">Draft / Menunggu Persetujuan</span>. Admin akan menghubungi Anda via WhatsApp setelah verifikasi pembayaran DP.
            </div>
          </div>
        </div>
      </div>

      {/* Navigation actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-border/20">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isPending}
          className="font-sans text-xs uppercase tracking-widest py-5 px-8 rounded-none border-border order-2 sm:order-1"
        >
          ← Kembali
        </Button>
        <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
          {isPayRetry && onCancelPayment && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancelPayment}
              disabled={isPending}
              className="font-sans text-xs uppercase tracking-widest py-5 px-6 rounded-none text-red-700 hover:text-red-800 hover:bg-red-50 border border-transparent hover:border-red-200 cursor-pointer font-semibold"
            >
              Ganti Metode Pembayaran
            </Button>
          )}
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isPending}
            className="font-sans text-xs uppercase tracking-widest py-5 px-10 rounded-none font-bold text-white transition-all hover:opacity-90 cursor-pointer flex items-center gap-2"
          >
            {isPending ? "Memproses Pemesanan..." : (isPayRetry ? "Bayar Sekarang" : "Konfirmasi & Lanjutkan")}
          </Button>
        </div>
      </div>
    </div>
  );
}
