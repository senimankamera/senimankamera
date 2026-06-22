"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Calendar,
  Settings,
  LogOut,
  ClipboardList,
  Tag,
  FileSpreadsheet,
  FileText,
  MessageSquare,
  ChevronDown,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { logoutAction } from "@/src/modules/auth/actions/login.action";
import { SessionTimeout } from "@/components/session-timeout";
import { useModal } from "@/components/modal-provider";

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isCmsOpen, setIsCmsOpen] = useState(false);
  const { confirm } = useModal();

  // Sync state from localStorage on mount (client-side only)
  useEffect(() => {
    const savedSchedule = localStorage.getItem("sidebar_schedule_open");
    const savedCms = localStorage.getItem("sidebar_cms_open");
    if (savedSchedule !== null) {
      setIsScheduleOpen(savedSchedule === "true");
    }
    if (savedCms !== null) {
      setIsCmsOpen(savedCms === "true");
    }
  }, []);

  const toggleSchedule = () => {
    const nextState = !isScheduleOpen;
    setIsScheduleOpen(nextState);
    localStorage.setItem("sidebar_schedule_open", String(nextState));
  };

  const toggleCms = () => {
    const nextState = !isCmsOpen;
    setIsCmsOpen(nextState);
    localStorage.setItem("sidebar_cms_open", String(nextState));
  };

  const scheduleMenuItems = [
    { name: "Ringkasan", href: "/admin", icon: LayoutDashboard },
    { name: "Booking", href: "/admin/bookings", icon: ClipboardList },
    { name: "Riwayat", href: "/admin/history", icon: History },
    { name: "Kalender", href: "/admin/calendar", icon: Calendar },
    { name: "Rekap", href: "/admin/recap", icon: FileSpreadsheet },
  ];

  const cmsMenuItems = [
    { name: "Galeri", href: "/admin/galleries", icon: ImageIcon },
    { name: "Kategori", href: "/admin/categories", icon: Tag },
    { name: "Paket", href: "/admin/packages", icon: Settings },
    { name: "Testimoni", href: "/admin/testimonials", icon: MessageSquare },
    { name: "Pengaturan S&K", href: "/admin/settings", icon: FileText },
  ];

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault();
    const isConfirmed = await confirm("Apakah Anda yakin ingin keluar?");
    if (isConfirmed) {
      await logoutAction();
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SessionTimeout />

      {/* Brand Header */}
      <SidebarHeader className="border-b border-border/40 py-6 px-4 group-data-[state=collapsed]:px-2 transition-all duration-300">
        <div className="flex items-center gap-3 overflow-hidden justify-start group-data-[state=collapsed]:justify-center">
          <img src="/logo.png" alt="SENIMAN_KAMERA" className="h-8 w-auto object-contain flex-shrink-0" />
          <div className="group-data-[state=collapsed]:hidden transition-all duration-300 whitespace-nowrap">
            <h1 className="font-serif text-base font-semibold leading-tight text-primary">Admin Studio</h1>
            <p className="font-sans text-[9px] uppercase tracking-widest text-secondary font-bold">Kelola Portofolio</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Main Content Links */}
      <SidebarContent className="py-4 px-3 space-y-4">
        {/* Section 1: Kelola Jadwal & Pesanan */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel 
            onClick={toggleSchedule}
            className="font-sans text-[9px] uppercase tracking-widest text-secondary/60 hover:text-primary transition-colors font-bold mb-2 px-3 flex items-center justify-between cursor-pointer w-full select-none"
          >
            <span>Jadwal & Pesanan</span>
            <ChevronDown className={cn("w-3 h-3 transition-transform duration-200 group-data-[state=collapsed]:hidden", !isScheduleOpen && "-rotate-90")} />
          </SidebarGroupLabel>
          <SidebarGroupContent className={cn("transition-all duration-300", !isScheduleOpen && "hidden group-data-[state=collapsed]:block")}>
            <SidebarMenu className="gap-1">
              {scheduleMenuItems.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      className={`py-6 px-3 flex items-center gap-3 font-sans text-xs uppercase tracking-widest font-bold w-full transition-colors ${active
                          ? "text-primary-foreground! bg-primary! hover:bg-primary/95! hover:text-primary-foreground!"
                          : "text-secondary hover:text-primary"
                        }`}
                      tooltip={item.name}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="group-data-[state=collapsed]:hidden">{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-3 bg-border/20" />

        {/* Section 2: CMS */}
        <SidebarGroup className="p-0">
          <SidebarGroupLabel 
            onClick={toggleCms}
            className="font-sans text-[9px] uppercase tracking-widest text-secondary/60 hover:text-primary transition-colors font-bold mb-2 px-3 flex items-center justify-between cursor-pointer w-full select-none"
          >
            <span>Manajemen Konten (CMS)</span>
            <ChevronDown className={cn("w-3 h-3 transition-transform duration-200 group-data-[state=collapsed]:hidden", !isCmsOpen && "-rotate-90")} />
          </SidebarGroupLabel>
          <SidebarGroupContent className={cn("transition-all duration-300", !isCmsOpen && "hidden group-data-[state=collapsed]:block")}>
            <SidebarMenu className="gap-1">
              {cmsMenuItems.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      className={`py-6 px-3 flex items-center gap-3 font-sans text-xs uppercase tracking-widest font-bold w-full transition-colors ${active
                          ? "text-primary-foreground! bg-primary! hover:bg-primary/95! hover:text-primary-foreground!"
                          : "text-secondary hover:text-primary"
                        }`}
                      tooltip={item.name}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="group-data-[state=collapsed]:hidden">{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer Actions */}
      <SidebarFooter className="border-t border-border/40 py-6 px-4 group-data-[state=collapsed]:px-2 gap-4 mt-auto transition-all duration-300">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <form onSubmit={handleSignOut} className="w-full flex justify-start group-data-[state=collapsed]:justify-center">
              <SidebarMenuButton type="submit" className="py-4 px-2 w-full text-left hover:bg-red-50 dark:hover:bg-red-950/10 rounded-none flex items-center justify-start group-data-[state=collapsed]:justify-center" tooltip="Keluar">
                <span className="flex items-center gap-3 font-sans text-xs uppercase tracking-widest font-bold text-red-600 hover:text-red-700 transition-colors w-full justify-start group-data-[state=collapsed]:justify-center">
                  <LogOut className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="group-data-[state=collapsed]:hidden">Keluar</span>
                </span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
