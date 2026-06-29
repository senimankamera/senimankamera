import { redirect } from "next/navigation";
import { getBookingByIdAction } from "@/src/modules/booking/actions/get-booking-by-id.action";
import { BookingSuccessView } from "@/src/modules/booking/components/booking-success-view";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cancelDraftBookingAction } from "@/src/modules/booking/actions/cancel-draft-booking.action";

export const revalidate = 0; // Dynamic route

interface BookingSuccessPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BookingSuccessPage({ searchParams }: BookingSuccessPageProps) {
  const resolvedSearchParams = await searchParams;
  const orderId = resolvedSearchParams.order_id;

  if (!orderId || typeof orderId !== "string") {
    redirect("/book");
  }

  const result = await getBookingByIdAction(orderId);

  if (!result.success || !result.data) {
    const isCancelled = result.error === "Booking tidak ditemukan.";
    const title = isCancelled ? "Pemesanan Dibatalkan" : "Pemesanan Tidak Ditemukan";
    const message = isCancelled 
      ? "Pembayaran Anda dibatalkan, telah kedaluwarsa, atau pemesanan ini telah diproses. Silakan lakukan pemesanan kembali jika Anda ingin menjadwalkan ulang."
      : (result.error || "Kami tidak dapat menemukan detail pemesanan dengan ID yang diberikan.");

    return (
      <div className="w-full max-w-[1440px] mx-auto px-6 md:px-20 py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-full max-w-md border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/30 p-8 text-center flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-red-700 dark:text-red-400 mb-4 stroke-1 animate-pulse" />
          <h2 className="font-serif text-2xl text-red-900 dark:text-red-300 mb-2 font-medium">{title}</h2>
          <p className="font-sans text-xs text-red-700 dark:text-red-400 font-light mb-6 leading-relaxed">
            {message}
          </p>
          <a href="/book" className="w-full">
            <Button className="rounded-none font-sans text-xs uppercase tracking-widest py-5 text-white bg-primary hover:opacity-90 w-full cursor-pointer">
              Kembali ke Halaman Booking
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 md:px-20 py-20">
      <BookingSuccessView booking={result.data} />
    </div>
  );
}
