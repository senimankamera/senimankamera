"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    { name: "Layanan", href: "/services" },
    { name: "Kontak", href: "/#contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 backdrop-blur-md ${isScrolled
          ? "bg-background/95 border-border py-4 shadow-sm"
          : "bg-background/70 border-transparent py-6"
          }`}
      >
        <div className="flex justify-between items-center px-6 md:px-20 w-full max-w-[1440px] mx-auto">
          {/* Mobile Menu Toggle */}
          <button
            aria-label="Toggle Menu"
            className="md:hidden text-foreground hover:opacity-80 transition-all focus:outline-none"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Brand Logo */}
          <Link
            href="/"
            className="font-serif text-2xl md:text-3xl tracking-tighter text-primary flex items-center gap-3"
          >
            <img
              src="/logo.png"
              alt="SENIMAN_KAMERA"
              className="h-8 w-auto object-contain"
            />
          </Link>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8 font-sans text-xs tracking-[0.15em] uppercase font-bold">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`py-1 transition-all duration-300 hover:text-foreground ${active
                    ? "text-foreground border-b border-foreground"
                    : "text-foreground/70"
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              href="/#contact"
              className={cn(
                buttonVariants({ variant: "default" }),
                "font-sans text-xs uppercase tracking-[0.15em] px-8 py-6 rounded-none"
              )}
            >
              Pesan Sesi
            </Link>
          </div>

          {/* Mobile Spacer to balance layout */}
          <div className="md:hidden w-6"></div>
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
                className={`py-2 border-b border-border/40 ${isActive(link.href) ? "text-foreground border-l-2 border-foreground pl-2" : "text-foreground/70"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="mt-auto">
            <Link
              href="/#contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                buttonVariants({ variant: "default" }),
                "w-full font-sans text-xs uppercase tracking-[0.15em] py-6 rounded-none text-center"
              )}
            >
              Pesan Sesi
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
