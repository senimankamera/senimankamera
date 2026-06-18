"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Calendar,
  Users,
  Upload,
  Settings,
  LogOut,
  ClipboardList,
  Tag,
  FileSpreadsheet
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
} from "@/components/ui/sidebar";
import { logoutAction } from "@/src/modules/auth/actions/login.action";
import { SessionTimeout } from "@/components/session-timeout";

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Ringkasan", href: "/admin", icon: LayoutDashboard },
    { name: "Booking", href: "/admin/bookings", icon: ClipboardList },
    { name: "Kalender", href: "/admin/calendar", icon: Calendar },
    { name: "Rekap", href: "/admin/recap", icon: FileSpreadsheet },
    { name: "Galeri", href: "/admin/galleries", icon: ImageIcon },
    { name: "Paket", href: "/admin/packages", icon: Settings },
    { name: "Kategori", href: "/admin/categories", icon: Tag },
  ];

  const handleSignOut = async (e: React.FormEvent) => {
    e.preventDefault();
    await logoutAction();
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SessionTimeout />

      {/* Brand Header */}
      <SidebarHeader className="border-b border-border/40 py-6 px-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="SENIMAN_KAMERA" className="h-8 w-auto object-contain" />
          <div>
            <h1 className="font-serif text-base font-semibold leading-tight text-primary">Admin Studio</h1>
            <p className="font-sans text-[9px] uppercase tracking-widest text-secondary font-bold">Kelola Portofolio</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Main Content Links */}
      <SidebarContent className="py-6 px-3">
        <SidebarMenu className="gap-1">
          {menuItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  isActive={active}
                  className={`py-6 px-3 flex items-center gap-3 font-sans text-xs uppercase tracking-widest font-bold w-full ${active
                      ? "text-primary-foreground bg-primary hover:bg-primary/90"
                      : "text-secondary hover:text-primary transition-colors"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Sidebar Footer Actions */}
      <SidebarFooter className="border-t border-border/40 py-6 px-4 gap-4 mt-auto">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <form onSubmit={handleSignOut} className="w-full">
              <SidebarMenuButton type="submit" className="py-4 px-2 w-full text-left hover:bg-red-50 dark:hover:bg-red-950/10 rounded-none">
                <span className="flex items-center gap-3 font-sans text-xs uppercase tracking-widest font-bold text-red-600 hover:text-red-700 transition-colors w-full">
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span>Keluar</span>
                </span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
