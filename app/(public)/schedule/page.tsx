import type { Metadata } from "next";
import { PublicCalendarView } from "@/src/modules/booking/components/public-calendar-view";

export const revalidate = 0; // Dynamic real-time schedule

export const metadata: Metadata = {
  title: "Ketersediaan Jadwal | Seniman Kamera",
  description:
    "Pantau jadwal ketersediaan tanggal dan slot sesi pemotretan foto maupun video secara real-time di Seniman Kamera Bandung.",
};

export default function SchedulePage() {
  return (
    <div className="w-full pb-24">
      {/* Hero Section */}
      <section className="pt-20 pb-12 px-6 md:px-20 w-full max-w-[1440px] mx-auto flex flex-col items-center text-center">
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-secondary mb-4 block font-bold">
          Ketersediaan Tanggal & Waktu
        </span>
        <h1 className="font-serif text-4xl md:text-6xl text-primary max-w-4xl mb-6 font-medium">
          Jadwal Sesi Pemotretan
        </h1>
        <p className="font-sans text-base md:text-lg text-secondary max-w-2xl mx-auto font-light leading-relaxed">
          Pilih tanggal yang tersedia untuk melihat rincian slot jam pemotretan. Pastikan tanggal favorit Anda belum terisi sebelum melakukan booking.
        </p>
      </section>

      {/* Main Calendar View Section */}
      <section className="px-6 md:px-20 w-full max-w-[1440px] mx-auto">
        <PublicCalendarView />
      </section>
    </div>
  );
}
