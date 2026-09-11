"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Calendar } from "lucide-react";

export function FloatingBookingButton() {
  const pathname = usePathname();

  // Hide on booking process, success screen, admin, or login pages
  if (
    pathname.startsWith("/book") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login")
  ) {
    return null;
  }

  return (
    <aside
      aria-label="Aksi Cepat Booking"
      className="fixed bottom-8 right-8 z-40 hidden md:flex items-center"
    >
      <Link
        href="/services"
        className="group relative flex items-center gap-3 bg-primary text-primary-foreground px-6 py-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-primary/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-all duration-300 rounded-full hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Booking Sesi Foto Sekarang"
      >
        <span className="font-sans text-xs uppercase tracking-[0.18em] font-bold">
          Booking Sekarang
        </span>
        <div className="w-6 h-6 rounded-full bg-primary-foreground/15 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5">
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </Link>
    </aside>
  );
}
