import { BookingTracker } from "@/src/modules/booking/components/booking-tracker";
import type { Metadata } from "next";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Lacak Pesanan | Seniman Kamera",
  description: "Lacak status pemesanan sesi pemotretan Anda di Seniman Kamera secara real-time.",
};

interface TrackPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TrackPage({ searchParams }: TrackPageProps) {
  const resolvedSearchParams = await searchParams;
  const bookingId = (resolvedSearchParams.order_id as string) || (resolvedSearchParams.booking_id as string) || "";
  const email = (resolvedSearchParams.email as string) || "";

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 md:px-20 py-16 md:py-24">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center mb-12 max-w-2xl mx-auto space-y-4">
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-secondary font-bold block">
          Layanan Pelanggan
        </span>
        <h1 className="font-serif text-4xl md:text-6xl text-primary font-medium">
          Tracking Pesanan
        </h1>
        <p className="font-sans text-sm md:text-base text-secondary font-light leading-relaxed">
          Cek status terkini jadwal sesi pemotretan Anda dan unduh bukti pembayaran resmi kapan saja.
        </p>
      </div>

      <BookingTracker initialBookingId={bookingId} initialEmail={email} />
    </div>
  );
}
