"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Camera, Calendar, LayoutGrid, Send } from "lucide-react";

interface MobileBottomNavProps {
  onOpenCalendar: () => void;
}

export function MobileBottomNav({ onOpenCalendar }: MobileBottomNavProps) {
  const pathname = usePathname();

  const isHomeActive = pathname === "/";
  const isServicesActive = pathname.startsWith("/services");
  const isGalleryActive = pathname.startsWith("/portfolio");
  const isBookingActive = pathname.startsWith("/book");

  return (
    <nav
      aria-label="Navigasi Mobile"
      className="fixed bottom-3 inset-x-3 z-50 pb-[env(safe-area-inset-bottom,0px)] md:hidden pointer-events-none"
    >
      <div className="max-w-md mx-auto bg-card/90 backdrop-blur-xl border border-border/50 rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.08)] px-2 py-1.5 flex items-center justify-between pointer-events-auto">
        {/* 1. Beranda */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] flex-1 transition-colors ${
            isHomeActive
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground font-medium"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-wider uppercase mt-0.5">
            Beranda
          </span>
        </Link>

        {/* 2. Layanan */}
        <Link
          href="/services"
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] flex-1 transition-colors ${
            isServicesActive
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground font-medium"
          }`}
        >
          <Camera className="w-5 h-5" />
          <span className="text-[10px] tracking-wider uppercase mt-0.5">
            Layanan
          </span>
        </Link>

        {/* 3. Cek Jadwal (Elevated Center Button) */}
        <button
          type="button"
          onClick={onOpenCalendar}
          className="-my-3 flex flex-col items-center justify-center focus:outline-none group px-1"
          aria-label="Cek Ketersediaan Jadwal"
        >
          <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_2px_12px_rgba(0,0,0,0.2)] group-hover:opacity-90 active:scale-95 transition-all">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-[9px] tracking-wider uppercase font-bold text-foreground mt-1">
            Jadwal
          </span>
        </button>

        {/* 4. Galeri */}
        <Link
          href="/portfolio"
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] flex-1 transition-colors ${
            isGalleryActive
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground font-medium"
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] tracking-wider uppercase mt-0.5">
            Galeri
          </span>
        </Link>

        {/* 5. Booking */}
        <Link
          href="/book"
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] flex-1 transition-colors ${
            isBookingActive
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground font-medium"
          }`}
        >
          <Send className="w-5 h-5" />
          <span className="text-[10px] tracking-wider uppercase mt-0.5">
            Booking
          </span>
        </Link>
      </div>
    </nav>
  );
}
