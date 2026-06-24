"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getCurrentAdminAction } from "@/src/modules/auth/actions/get-current-admin.action";
import { logoutAction } from "@/src/modules/auth/actions/login.action";
import { useModal } from "@/components/modal-provider";
import { ChevronDown, LogOut, Shield } from "lucide-react";

interface AdminHeaderProps {
  title?: string;
}

export function AdminHeader({ title = "Manajemen Studio Seniman Kamera" }: AdminHeaderProps) {
  const [adminProfile, setAdminProfile] = useState<{
    name: string;
    email: string;
    username: string;
    role: string;
  } | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { confirm } = useModal();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadProfile() {
      const res = await getCurrentAdminAction();
      if (res.success && res.data) {
        setAdminProfile(res.data);
      }
    }
    loadProfile();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    const isConfirmed = await confirm("Apakah Anda yakin ingin keluar?");
    if (isConfirmed) {
      startTransition(async () => {
        await logoutAction();
      });
    }
  };

  return (
    <header className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-border/40 bg-background sticky top-0 z-40">
      {/* Left side: Sidebar Trigger & Page Title */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-secondary hover:text-primary transition-colors" />
        <img src="/logo.png" alt="SENIMAN_KAMERA" className="h-6 w-auto object-contain md:hidden" />
        <span className="font-serif tracking-tighter font-semibold md:hidden">Admin</span>
        <div className="hidden md:block">
          <span className="font-sans text-[10px] uppercase tracking-widest text-secondary font-bold">
            {title}
          </span>
        </div>
      </div>

      {/* Right side: Admin Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        {adminProfile ? (
          <>
            <div
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 cursor-pointer select-none hover:opacity-90 transition-opacity py-1 px-2 border border-transparent hover:border-border/30 rounded-none bg-muted/20"
            >
              {/* Initial Avatar */}
              <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-serif text-xs font-semibold shrink-0">
                {adminProfile.name.charAt(0).toUpperCase()}
              </div>

              {/* Admin Name & Dropdown Icon */}
              <span className="hidden sm:inline font-sans text-xs font-semibold text-primary truncate max-w-[120px]">
                {adminProfile.name}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-secondary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border/40 shadow-xl rounded-none py-4 px-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Profile Header Details */}
                <div className="space-y-1 pb-3.5 border-b border-border/20">
                  <p className="font-sans text-xs font-bold text-primary truncate">
                    {adminProfile.name}
                  </p>
                  <p className="font-sans text-[10px] text-secondary truncate">
                    {adminProfile.email}
                  </p>
                  
                  {/* Role Badge */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-2 font-sans text-[8px] font-bold uppercase tracking-widest bg-neutral-100 dark:bg-neutral-800 border border-border/30 text-secondary rounded-sm">
                    <Shield className="w-2.5 h-2.5 text-secondary" />
                    {adminProfile.role === "SUPER_ADMIN"
                      ? "Super Admin"
                      : adminProfile.role === "ADMIN_PESANAN"
                      ? "Admin Pesanan"
                      : "Admin CMS"}
                  </span>
                </div>

                {/* Logout Trigger */}
                <div className="pt-3.5">
                  <button
                    onClick={handleSignOut}
                    disabled={isPending}
                    className="w-full py-2 px-3 text-left font-sans text-[10px] uppercase tracking-widest font-bold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/10 transition-colors flex items-center gap-2 rounded-none cursor-pointer disabled:opacity-40"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-600" />
                    {isPending ? "Keluar..." : "Keluar"}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Profile Loading Skeleton */
          <div className="flex items-center gap-2 animate-pulse">
            <div className="w-7 h-7 rounded-full bg-muted" />
            <div className="w-16 h-3 bg-muted hidden sm:block" />
          </div>
        )}
      </div>
    </header>
  );
}
