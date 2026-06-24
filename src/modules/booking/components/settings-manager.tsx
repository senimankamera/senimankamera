"use client";

import { useState, useTransition } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminHeader } from "@/components/admin-header";
import { AdminSidebar } from "@/components/admin-sidebar";
import { updateTermsContentAction } from "../actions/update-terms-content.action";
import {
  Save,
  AlertCircle,
  FileText,
  Plus,
  X,
  Edit2,
  UserX,
  UserCheck,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useModal } from "@/components/modal-provider";

// Import server actions untuk manajemen admin
import { createAdminAction } from "@/src/modules/admin-management/actions/create-admin.action";
import { updateAdminRoleAction } from "@/src/modules/admin-management/actions/update-admin-role.action";
import { deactivateAdminAction } from "@/src/modules/admin-management/actions/deactivate-admin.action";

interface SettingsManagerProps {
  initialTncTimeBased: string;
  initialTncDateOnly: string;
  admins?: any[];
  currentAdmin?: {
    id: string;
    supabaseId: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  };
}

export function SettingsManager({
  initialTncTimeBased,
  initialTncDateOnly,
  admins = [],
  currentAdmin,
}: SettingsManagerProps) {
  // Tab State
  const [activeTab, setActiveTab] = useState<"tnc" | "admins">("tnc");

  // T&C States
  const [tncTimeBased, setTncTimeBased] = useState(initialTncTimeBased);
  const [tncDateOnly, setTncDateOnly] = useState(initialTncDateOnly);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Admin Management States
  const [adminList, setAdminList] = useState<any[]>(admins);
  const [adminForm, setAdminForm] = useState({
    id: "",
    name: "",
    email: "",
    username: "",
    password: "",
    role: "ADMIN_PESANAN",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isAdminPending, startAdminTransition] = useTransition();

  const { alert, confirm } = useModal();

  // Handle T&C Submit
  const handleTncSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await updateTermsContentAction({
        tncTimeBased,
        tncDateOnly,
      });

      if (response.success) {
        toast.success("Pengaturan Syarat & Ketentuan berhasil diperbarui!");
      } else {
        setError(response.error || "Gagal menyimpan perubahan.");
        toast.error("Gagal menyimpan perubahan.");
      }
    });
  };

  // Handle Admin Form Change
  const handleAdminFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAdminForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Create or Update Admin
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    startAdminTransition(async () => {
      if (isEditMode) {
        // Edit Role Mode
        const res = await updateAdminRoleAction(adminForm.id, adminForm.role as any);
        if (res.success && res.data) {
          setAdminList((prev) =>
            prev.map((a) => (a.id === adminForm.id ? { ...a, role: res.data.role } : a))
          );
          toast.success("Peran admin berhasil diperbarui!");
          resetAdminForm();
        } else {
          setAdminError(res.error || "Gagal memperbarui peran admin.");
        }
      } else {
        // Create Mode
        const res = await createAdminAction({
          name: adminForm.name,
          email: adminForm.email,
          username: adminForm.username,
          password: adminForm.password,
          role: adminForm.role as any,
        });

        if (res.success && res.data) {
          setAdminList((prev) => [res.data, ...prev]);
          toast.success("Admin baru berhasil ditambahkan!");
          resetAdminForm();
        } else {
          setAdminError(res.error || "Gagal menambahkan admin baru.");
        }
      }
    });
  };

  const resetAdminForm = () => {
    setAdminForm({
      id: "",
      name: "",
      email: "",
      username: "",
      password: "",
      role: "ADMIN_PESANAN",
    });
    setIsEditMode(false);
    setAdminError(null);
  };

  const handleEditAdminClick = (admin: any) => {
    setAdminForm({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      username: admin.username,
      password: "", // password kosong di mode edit
      role: admin.role,
    });
    setIsEditMode(true);
    setAdminError(null);
  };

  const handleDeactivateAdmin = async (admin: any) => {
    const isConfirmed = await confirm(
      `Apakah Anda yakin ingin menonaktifkan admin ${admin.name}? Akun ini akan dihapus dari sistem login.`
    );
    if (!isConfirmed) return;

    startAdminTransition(async () => {
      const res = await deactivateAdminAction(admin.id);
      if (res.success && res.data) {
        setAdminList((prev) =>
          prev.map((a) => (a.id === admin.id ? { ...a, isActive: false } : a))
        );
        toast.success("Admin berhasil dinonaktifkan!");
      } else {
        await alert(res.error || "Gagal menonaktifkan admin.");
      }
    });
  };

  return (
    <SidebarProvider>
      <AdminSidebar variant="sidebar" />
      <SidebarInset className="flex flex-col min-h-screen bg-background text-foreground">
        <AdminHeader title="Manajemen Studio Seniman Kamera" />

        {/* Content Container */}
        <div className="flex-1 px-6 md:px-12 py-10 max-w-[1200px] mx-auto w-full space-y-12">
          {/* Header Title & Switch Tab */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/20 pb-6">
            <div className="space-y-2">
              <h2 className="font-serif text-3xl md:text-5xl text-primary font-medium">
                {activeTab === "tnc" ? "Pengaturan S&K" : "Manajemen Admin"}
              </h2>
              <p className="font-sans text-sm text-secondary font-light">
                {activeTab === "tnc"
                  ? "Kelola teks Syarat & Ketentuan yang akan ditampilkan ke klien sebelum pembayaran."
                  : "Kelola akun pengguna admin, peran, dan hak akses mereka."}
              </p>
            </div>

            {currentAdmin?.role === "SUPER_ADMIN" && (
              <div className="flex gap-2 shrink-0">
                <Button
                  type="button"
                  variant={activeTab === "tnc" ? "default" : "outline"}
                  onClick={() => {
                    setActiveTab("tnc");
                    resetAdminForm();
                  }}
                  className="rounded-none uppercase tracking-widest text-[10px] font-bold py-5 px-5 cursor-pointer"
                >
                  Syarat & Ketentuan
                </Button>
                <Button
                  type="button"
                  variant={activeTab === "admins" ? "default" : "outline"}
                  onClick={() => setActiveTab("admins")}
                  className="rounded-none uppercase tracking-widest text-[10px] font-bold py-5 px-5 cursor-pointer"
                >
                  Manajemen Admin
                </Button>
              </div>
            )}
          </div>

          {/* TAB 1: SYARAT & KETENTUAN */}
          {activeTab === "tnc" && (
            <form onSubmit={handleTncSubmit} className="space-y-8 max-w-4xl">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-800 flex items-center gap-2.5 text-xs font-sans">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-8">
                {/* Card 1: Time-Based */}
                <div className="border border-border/40 bg-card p-6 space-y-4 rounded-none font-sans text-xs">
                  <h3 className="font-serif text-lg text-primary font-semibold flex items-center gap-2 pb-3 border-b border-border/20 uppercase tracking-wider text-xs">
                    <FileText className="w-4 h-4 text-blue-600" />
                    S&K Kategori Waktu (TIME_BASED)
                  </h3>
                  <p className="text-secondary leading-relaxed mb-2">
                    Ditampilkan untuk paket dengan kategori slot waktu (contoh: Studio, Graduasi, Sesi Singkat).
                  </p>
                  <textarea
                    rows={10}
                    value={tncTimeBased}
                    onChange={(e) => setTncTimeBased(e.target.value)}
                    className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary font-sans text-xs leading-relaxed"
                    placeholder="Tuliskan syarat & ketentuan di sini..."
                    required
                  />
                </div>

                {/* Card 2: Date-Only */}
                <div className="border border-border/40 bg-card p-6 space-y-4 rounded-none font-sans text-xs">
                  <h3 className="font-serif text-lg text-primary font-semibold flex items-center gap-2 pb-3 border-b border-border/20 uppercase tracking-wider text-xs">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    S&K Kategori Harian (DATE_ONLY)
                  </h3>
                  <p className="text-secondary leading-relaxed mb-2">
                    Ditampilkan untuk paket yang di-booking seharian penuh (contoh: Wedding, Event besar, Dokumentasi Out-door).
                  </p>
                  <textarea
                    rows={10}
                    value={tncDateOnly}
                    onChange={(e) => setTncDateOnly(e.target.value)}
                    className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary font-sans text-xs leading-relaxed"
                    placeholder="Tuliskan syarat & ketentuan di sini..."
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="uppercase tracking-widest py-6 px-10 rounded-none font-bold text-white cursor-pointer flex items-center gap-2 text-xs"
                >
                  <Save className="w-4 h-4" />
                  {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 2: MANAJEMEN ADMIN (Hanya Super Admin) */}
          {activeTab === "admins" && currentAdmin?.role === "SUPER_ADMIN" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Side */}
              <form
                onSubmit={handleAdminSubmit}
                className="lg:col-span-4 border border-border/40 bg-card p-6 space-y-5 rounded-none font-sans text-xs"
              >
                <h3 className="font-serif text-lg text-primary mb-4 font-semibold flex items-center justify-between pb-3 border-b border-border/20">
                  <span className="flex items-center gap-2">
                    {isEditMode ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isEditMode ? "Ubah Peran Admin" : "Tambah Admin Baru"}
                  </span>
                  {isEditMode && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={resetAdminForm}
                      className="h-6 w-6 p-0 text-secondary hover:text-primary cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </h3>

                {adminError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-800 flex items-center gap-2 text-[10px]">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{adminError}</span>
                  </div>
                )}

                {/* Nama Lengkap */}
                <div className="space-y-1.5">
                  <label className="uppercase tracking-wider text-secondary font-bold block">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={adminForm.name}
                    onChange={handleAdminFormChange}
                    placeholder="Nama Lengkap Admin"
                    disabled={isEditMode}
                    className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary disabled:bg-muted/10 disabled:text-secondary"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="uppercase tracking-wider text-secondary font-bold block">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={adminForm.email}
                    onChange={handleAdminFormChange}
                    placeholder="email@domain.com"
                    disabled={isEditMode}
                    className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary disabled:bg-muted/10 disabled:text-secondary"
                    required
                  />
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <label className="uppercase tracking-wider text-secondary font-bold block">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={adminForm.username}
                    onChange={handleAdminFormChange}
                    placeholder="username123"
                    disabled={isEditMode}
                    className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary disabled:bg-muted/10 disabled:text-secondary"
                    required
                  />
                </div>

                {/* Password (Hanya di mode create) */}
                {!isEditMode && (
                  <div className="space-y-1.5">
                    <label className="uppercase tracking-wider text-secondary font-bold block">
                      Password (min 8 karakter)
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={adminForm.password}
                      onChange={handleAdminFormChange}
                      placeholder="********"
                      className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary"
                      required
                    />
                  </div>
                )}

                {/* Peran / Role */}
                <div className="space-y-1.5">
                  <label className="uppercase tracking-wider text-secondary font-bold block">
                    Peran (Role)
                  </label>
                  <select
                    name="role"
                    value={adminForm.role}
                    onChange={handleAdminFormChange}
                    className="w-full px-3 py-2 bg-background border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary"
                    required
                  >
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="ADMIN_PESANAN">Admin Pesanan</option>
                    <option value="ADMIN_CMS">Admin CMS</option>
                  </select>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isAdminPending}
                    className="w-full uppercase tracking-widest py-5 rounded-none font-bold text-white cursor-pointer"
                  >
                    {isAdminPending
                      ? "Memproses..."
                      : isEditMode
                      ? "Perbarui Peran"
                      : "Tambah Admin"}
                  </Button>
                </div>
              </form>

              {/* Table Side */}
              <div className="lg:col-span-8 border border-border/40 bg-card p-6 space-y-4 rounded-none font-sans text-xs">
                <h3 className="font-serif text-lg text-primary pb-3 border-b border-border/20 uppercase tracking-wider text-xs">
                  Daftar Admin Terdaftar
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="border-b border-border/40 uppercase tracking-wider text-secondary font-bold">
                        <th className="py-3 px-2">Nama</th>
                        <th className="py-3 px-2">Username / Email</th>
                        <th className="py-3 px-2">Peran</th>
                        <th className="py-3 px-2 text-center">Status</th>
                        <th className="py-3 px-2 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 text-primary">
                      {adminList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-secondary font-light">
                            Tidak ada admin terdaftar.
                          </td>
                        </tr>
                      ) : (
                        adminList.map((admin) => (
                          <tr key={admin.id} className="hover:bg-muted/10 transition-colors">
                            <td className="py-4 px-2 font-bold">{admin.name}</td>
                            <td className="py-4 px-2">
                              <div>@{admin.username}</div>
                              <div className="text-[10px] text-secondary">{admin.email}</div>
                            </td>
                            <td className="py-4 px-2">
                              <span
                                className={`px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-widest rounded-sm ${
                                  admin.role === "SUPER_ADMIN"
                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                    : admin.role === "ADMIN_PESANAN"
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                {admin.role === "SUPER_ADMIN"
                                  ? "Super"
                                  : admin.role === "ADMIN_PESANAN"
                                  ? "Pesanan"
                                  : "CMS"}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-center">
                              <span
                                className={`px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-widest rounded-sm ${
                                  admin.isActive
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                              >
                                {admin.isActive ? "Aktif" : "Nonaktif"}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-right">
                              <div className="flex justify-end gap-1.5">
                                {/* Edit Role Button */}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  title="Ubah Peran"
                                  disabled={admin.supabaseId === currentAdmin?.supabaseId}
                                  onClick={() => handleEditAdminClick(admin)}
                                  className="h-8 w-8 text-secondary hover:text-primary cursor-pointer disabled:opacity-40"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </Button>

                                {/* Deactivate Button */}
                                {admin.isActive ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    title="Nonaktifkan Admin"
                                    disabled={
                                      admin.role === "SUPER_ADMIN" ||
                                      admin.supabaseId === currentAdmin?.supabaseId
                                    }
                                    onClick={() => handleDeactivateAdmin(admin)}
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/10 cursor-pointer disabled:opacity-40"
                                  >
                                    <UserX className="w-3.5 h-3.5" />
                                  </Button>
                                ) : (
                                  <div className="h-8 w-8 flex items-center justify-center text-secondary/40">
                                    <UserCheck className="w-3.5 h-3.5 opacity-30" />
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Super Admin Lockout Warning */}
                <div className="p-3 bg-amber-50 dark:bg-amber-950/10 border border-amber-200 text-amber-800 rounded-none flex gap-2.5 text-[10px] leading-relaxed">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600" />
                  <div>
                    <span className="font-bold uppercase tracking-wider block mb-0.5">Catatan Keamanan</span>
                    Akun dengan peran <b>Super Admin</b> tidak dapat dinonaktifkan. Anda tidak dapat mengubah peran atau menonaktifkan akun Anda sendiri yang sedang aktif untuk menghindari lockout.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
