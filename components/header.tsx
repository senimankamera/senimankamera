"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Portofolio", href: "/portfolio" },
    { name: "Jadwal", href: "/schedule" },
    { name: "Layanan", href: "/services" },
    { name: "Informasi Harga", href: "/pricing" },
    { name: "Lacak Pesanan", href: "/track" },
    { name: "Kontak", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 backdrop-blur-md flex items-center ${
          isScrolled
            ? "h-12 md:h-14 bg-background/95 border-border shadow-sm"
            : "h-14 md:h-16 bg-background/90 border-border/40"
        }`}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-4 lg:px-8 xl:px-12 w-full max-w-[1440px] mx-auto">
          {/* Mobile Menu Toggle */}
          <button
            aria-label="Toggle Menu"
            className="md:hidden text-foreground hover:opacity-80 transition-all focus:outline-none"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Brand Logo (Left) */}
          <div className="flex items-center shrink-0 w-auto md:w-[80px] lg:w-[120px] xl:w-[150px]">
            <Link
              href="/"
              className="font-serif text-2xl md:text-3xl tracking-tighter text-primary flex items-center gap-3"
            >
              <img
                src="/logo.png"
                alt="SENIMAN_KAMERA"
                className={`w-auto object-contain transition-all duration-300 ${
                  isScrolled ? "h-6 md:h-7" : "h-7 md:h-8"
                }`}
              />
            </Link>
          </div>

          {/* Navigation Links (Desktop Centered) */}
          <div
            className={`hidden md:flex items-center justify-center flex-1 mx-1 lg:mx-4 gap-2 md:gap-3 lg:gap-5 xl:gap-7 font-sans uppercase font-bold transition-all duration-300 ${
              isScrolled
                ? "text-[10px] md:text-[10.5px] lg:text-xs tracking-[0.06em] md:tracking-[0.06em] lg:tracking-[0.1em] xl:tracking-[0.12em]"
                : "text-[11px] md:text-[11.5px] lg:text-xs xl:text-[13px] tracking-[0.08em] md:tracking-[0.08em] lg:tracking-[0.12em] xl:tracking-[0.15em]"
            }`}
          >
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const words = link.name.split(" ");
              const isMultiWord = words.length > 1;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`py-1 text-center flex flex-col items-center justify-center transition-all duration-300 hover:text-foreground ${
                    active
                      ? "text-foreground border-b border-foreground"
                      : "text-foreground/70"
                  }`}
                >
                  {isMultiWord ? (
                    <span className="flex flex-col items-center justify-center leading-tight">
                      {words.map((word, idx) => (
                        <span key={idx} className="whitespace-nowrap">
                          {word}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span className="whitespace-nowrap">{link.name}</span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Balancing Spacer for Desktop so Center Links stay perfectly centered */}
          <div className="hidden md:block shrink-0 w-auto md:w-[80px] lg:w-[120px] xl:w-[150px] pointer-events-none" aria-hidden="true" />

          {/* Spacer for Mobile to balance Hamburger menu */}
          <div className="w-6 md:hidden" aria-hidden="true" />
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col p-6 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex justify-between items-center mb-12">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              <img
                src="/logo.png"
                alt="SENIMAN_KAMERA"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-foreground hover:opacity-80 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col gap-6 font-sans text-lg tracking-[0.1em] uppercase font-bold flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-2 border-b border-border/40 ${
                  isActive(link.href)
                    ? "text-foreground border-l-2 border-foreground pl-2"
                    : "text-foreground/70"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="mt-auto">
            <Link
              href="/services"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "w-full text-center font-medium py-6"
              )}
            >
              Booking Sekarang
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Dock) */}
      <MobileBottomNav />
    </>
  );
}
