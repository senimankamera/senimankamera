"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, ExternalLink, XCircle, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBookingByIdAction } from "../actions/get-booking-by-id.action";
import { cancelDraftBookingAction } from "../actions/cancel-draft-booking.action";

interface BookingPendingViewProps {
  orderId: string;
  paymentUrl?: string;
}

export function BookingPendingView({ orderId, paymentUrl }: BookingPendingViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activePaymentUrl = paymentUrl || searchParams.get("payment_url") || "";

  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [draftInfo, setDraftInfo] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Otomatis buka halaman pembayaran DOKU saat komponen dimuat pertama kali
  useEffect(() => {
    if (activePaymentUrl) {
      const hasOpened = sessionStorage.getItem(`doku_opened_${orderId}`);
      if (!hasOpened) {
        sessionStorage.setItem(`doku_opened_${orderId}`, "true");
        window.open(activePaymentUrl, "_blank");
      }
    }
  }, [activePaymentUrl, orderId]);

  // Real-time polling setiap 3 detik untuk memeriksa apakah Webhook DOKU sudah mengonfirmasi pembayaran
  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const res = await getBookingByIdAction(orderId);
        if (!isMounted) return;

        if (res.success && res.data) {
          // Pembayaran SUCCESS! Webhook DOKU telah memverifikasi & memindahkan ke database permanen.
          router.push(`/book/success?order_id=${orderId}`);
        } else if (res.isPendingPayment && res.draftData) {
          setDraftInfo(res.draftData);
          setIsCheckingStatus(false);
        } else {
          setIsCheckingStatus(false);
        }
      } catch (err) {
        console.error("Polling check status error:", err);
        if (isMounted) setIsCheckingStatus(false);
      }
    };

    // Panggil langsung saat pertama kali
    checkStatus();

    // Set interval polling setiap 3 detik
    const interval = setInterval(checkStatus, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [orderId, router]);

  const handleOpenPaymentUrl = () => {
    if (activePaymentUrl) {
      window.open(activePaymentUrl, "_blank");
    }
  };

  const handleCancelBooking = async () => {
    if (confirm("Apakah Anda yakin ingin membatalkan pesanan ini? Slot jadwal akan dilepaskan kembali.")) {
      setIsCancelling(true);
      try {
        await cancelDraftBookingAction(orderId);
        sessionStorage.removeItem(`doku_opened_${orderId}`);
        router.push("/services");
      } catch (err: any) {
        setErrorMessage(err.message || "Gagal membatalkan pesanan.");
        setIsCancelling(false);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-6 font-sans">
      <div className="border border-border/40 bg-card p-8 md:p-10 shadow-xl space-y-8 text-center relative overflow-hidden">
        {/* Status Header */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-amber-600 dark:text-amber-400">
              Menunggu Pembayaran DOKU
            </span>
            <h1 className="font-serif text-2xl md:text-4xl text-primary font-medium">
              Memproses Verifikasi Sesi
            </h1>
            <p className="text-xs text-secondary font-light max-w-md mx-auto leading-relaxed pt-1">
              Halaman ini melakukan pengecekan status secara real-time. Begitu pembayaran selesai di portal DOKU, Anda akan otomatis diarahkan ke bukti pembayaran resmi.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-800 dark:text-red-300 text-xs text-center">
            {errorMessage}
          </div>
        )}

        {/* Info Box Draft */}
        <div className="bg-muted/20 border border-border/30 p-5 text-left space-y-3 text-xs">
          <div className="flex justify-between items-center border-b border-border/20 pb-2">
            <span className="text-secondary font-bold uppercase tracking-wider text-[10px]">Kode Tracking / Order ID</span>
            <span className="font-mono font-bold text-primary text-sm">{orderId}</span>
          </div>

          {draftInfo && (
            <div className="space-y-1.5 pt-1 text-secondary">
              <div className="flex justify-between">
                <span>Pemesan:</span>
                <span className="text-primary font-medium">{draftInfo.clientData?.fullName || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span>Paket:</span>
                <span className="text-primary font-medium">{draftInfo.packageType || "-"}</span>
              </div>
              <div className="flex justify-between font-bold text-primary pt-1 border-t border-dashed border-border/20">
                <span>Uang Muka (DP):</span>
                <span className="text-amber-600">Rp. {(draftInfo.dpAmount || 0).toLocaleString("id-ID")}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {activePaymentUrl && (
            <Button
              type="button"
              onClick={handleOpenPaymentUrl}
              className="w-full font-sans text-xs uppercase tracking-widest py-6 rounded-none font-bold text-white bg-primary hover:opacity-90 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Buka Halaman Pembayaran DOKU</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={handleCancelBooking}
            disabled={isCancelling}
            className="w-full font-sans text-xs uppercase tracking-widest py-6 rounded-none border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 cursor-pointer flex items-center justify-center gap-2 font-semibold"
          >
            {isCancelling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Membatalkan Pesanan...</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-red-600" />
                <span>Batalkan Pesanan Ini</span>
              </>
            )}
          </Button>
        </div>

        {/* Security Footer Note */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-secondary/70 italic pt-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Transaksi aman dan terenkripsi melalui DOKU Payment Gateway</span>
        </div>
      </div>
    </div>
  );
}
