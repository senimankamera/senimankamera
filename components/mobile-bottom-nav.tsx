"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Camera, Calendar, LayoutGrid, Search, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  onOpenCalendar?: () => void;
}

export function MobileBottomNav({ onOpenCalendar }: MobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Beranda",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      name: "Galeri",
      href: "/portfolio",
      icon: LayoutGrid,
      isActive: pathname.startsWith("/portfolio"),
    },
    {
      name: "Jadwal",
      href: "/schedule",
      icon: Calendar,
      isActive: pathname.startsWith("/schedule"),
    },
    {
      name: "Layanan",
      href: "/services",
      icon: Camera,
      isActive: pathname.startsWith("/services"),
    },
    {
      name: "Lacak",
      href: "/track",
      icon: Search,
      isActive: pathname.startsWith("/track"),
    },
    {
      name: "Booking",
      href: "/book",
      icon: Send,
      isActive: pathname.startsWith("/book"),
    },
  ];

  return (
    <nav
      aria-label="Navigasi Mobile"
      className="fixed bottom-3 inset-x-3 z-50 pb-[env(safe-area-inset-bottom,0px)] md:hidden pointer-events-none"
    >
      <div className="max-w-lg mx-auto bg-card/90 backdrop-blur-xl border border-border/50 rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.12)] p-1.5 flex items-center justify-between gap-1 pointer-events-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center min-w-[40px] py-1.5 px-1 rounded-full flex-1 transition-all duration-200 active:scale-90 select-none",
                active
                  ? "bg-foreground/10 text-foreground font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
                  : "text-muted-foreground/75 hover:text-foreground hover:bg-foreground/5 font-medium"
              )}
            >
              <Icon
                className={cn(
                  "w-[18px] h-[18px] transition-all duration-200",
                  active ? "stroke-[2.3] scale-105 text-primary" : "stroke-[1.75]"
                )}
              />
              <span className="text-[9px] tracking-wider uppercase mt-0.5 leading-none">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
