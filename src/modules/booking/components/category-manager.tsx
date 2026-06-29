"use client";

import { useState, useTransition } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminHeader } from "@/components/admin-header";
import { AdminSidebar } from "@/components/admin-sidebar";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "../actions/category-admin.action";
import { Trash2, Plus, Edit2, AlertCircle, Tag, Settings, X, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/modal-provider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CategoryItem {
  id: string;
  name: string;
  label: string;
  code?: string;
  description: string | null;
  order: number;
  bookingType: string;
  _count?: {
    packages: number;
  };
}

interface CategoryManagerProps {
  initialCategories: CategoryItem[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [filterBookingType, setFilterBookingType] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();
  const { alert, confirm } = useModal();

  const filteredCategories = filterBookingType === "ALL"
    ? categories
    : categories.filter((cat) => cat.bookingType === filterBookingType);

  // Form States
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("0");
  const [bookingType, setBookingType] = useState("DATE_ONLY");
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setEditId(null);
    setName("");
    setLabel("");
    setCode("");
    setDescription("");
    setOrder("0");
    setBookingType("DATE_ONLY");
    setError(null);
  };

  const handleEditClick = (cat: CategoryItem) => {
    setEditId(cat.id);
    setName(cat.name);
    setLabel(cat.label);
    setCode(cat.code || "");
    setDescription(cat.description || "");
    setOrder(cat.order.toString());
    setBookingType(cat.bookingType || "DATE_ONLY");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const orderNum = parseInt(order);
    if (!name || !label || !code || isNaN(orderNum)) {
      setError("Field Nama, Label, Kode Kategori (Prefix), dan Urutan wajib diisi.");
      return;
    }

    // Casing check: internal name usually alphanumeric
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      setError("Nama internal hanya boleh berisi huruf, angka, dash (-), dan underscore (_).");
      return;
    }

    const formattedCode = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

    startTransition(async () => {
      if (editId) {
        // Edit Mode
        const response = await updateCategoryAction(editId, {
          name,
          label,
          code: formattedCode,
          description: description || null,
          order: orderNum,
          bookingType,
        });

        if (response.success && response.data) {
          const updatedCat = response.data as CategoryItem;
          // Preserve count packages
          const existingCat = categories.find((c) => c.id === editId);
          updatedCat._count = existingCat?._count;

          setCategories((prev) =>
            prev
              .map((item) => (item.id === editId ? updatedCat : item))
              .sort((a, b) => a.order - b.order)
          );
          toast.success("Kategori berhasil diperbarui.");
          resetForm();
        } else {
          setError(response.error || "Gagal memperbarui kategori.");
        }
      } else {
        // Create Mode
        const response = await createCategoryAction({
          name,
          label,
          code: formattedCode,
          description: description || undefined,
          order: orderNum,
          bookingType,
        });

        if (response.success && response.data) {
          const newCat = response.data as CategoryItem;
          newCat._count = { packages: 0 };

          setCategories((prev) =>
            [...prev, newCat].sort((a, b) => a.order - b.order)
          );
          toast.success("Kategori baru berhasil ditambahkan.");
          resetForm();
        } else {
          setError(response.error || "Gagal menambahkan kategori.");
        }
      }
    });
  };

  const handleDelete = async (id: string, labelText: string) => {
    const isConfirmed = await confirm(`Apakah Anda yakin ingin menghapus kategori "${labelText}"?`);
    if (!isConfirmed) return;

    startTransition(async () => {
      const response = await deleteCategoryAction(id);
      if (response.success) {
        setCategories((prev) => prev.filter((item) => item.id !== id));
        toast.success(`Kategori "${labelText}" berhasil dihapus.`);
        if (editId === id) resetForm();
      } else {
        await alert(response.error || "Gagal menghapus kategori.");
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
          
          <div className="space-y-2">
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-medium">CMS Kategori</h2>
            <p className="font-sans text-sm text-secondary font-light">
              Kelola kategori acara yang terhubung dengan paket harga dan galeri portofolio.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Form Column (Left Panel) */}
            <form onSubmit={handleSubmit} className="lg:col-span-4 border border-border/40 bg-card p-6 space-y-5 rounded-none font-sans text-xs">
              <h3 className="font-serif text-lg text-primary mb-4 font-semibold flex items-center justify-between pb-3 border-b border-border/20">
                <span className="flex items-center gap-2">
                  {editId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editId ? "Edit Kategori" : "Kategori Baru"}
                </span>
                {editId && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={resetForm}
                    className="h-6 w-6 p-0 text-secondary hover:text-primary cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </h3>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-800 flex items-center gap-2 text-[10px]">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name (Internal Key) */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">
                  Nama Internal (Key)
                </label>
                <input
                  type="text"
                  placeholder="contoh: Wedding, Prewedding"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary"
                  required
                />
                <p className="text-[10px] text-secondary/60">
                  Digunakan sebagai key identitas di sistem. Tidak mengandung spasi.
                </p>
              </div>

              {/* Label (Display Name) */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">
                  Label Tampilan
                </label>
                <input
                  type="text"
                  placeholder="contoh: Pernikahan, Wisuda"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary"
                  required
                />
                <p className="text-[10px] text-secondary/60">
                  Nama yang akan ditampilkan ke publik / client.
                </p>
              </div>

              {/* Category Code Prefix */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">
                  Kode Kategori Prefix (WAJIB)
                </label>
                <input
                  type="text"
                  placeholder="contoh: EG, WDD, PRT"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary uppercase font-mono tracking-wider"
                  required
                />
                <p className="text-[10px] text-secondary/60">
                  Kode singkat huruf kapital yang akan digabungkan menjadi ID Booking (misal: EG).
                </p>
              </div>

              {/* Booking Type */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">
                  Tipe Booking
                </label>
                <select
                  value={bookingType}
                  onChange={(e) => setBookingType(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary"
                >
                  <option value="DATE_ONLY" className="bg-card text-primary">Satu Booking per Tanggal (DATE_ONLY)</option>
                  <option value="TIME_BASED" className="bg-card text-primary">Banyak Booking per Tanggal / Per Jam (TIME_BASED)</option>
                </select>
                <p className="text-[10px] text-secondary/60">
                  DATE_ONLY untuk kategori seperti Wedding. TIME_BASED untuk Graduasi/Studio.
                </p>
              </div>

              {/* Order */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">
                  Urutan Tampilan (Order)
                </label>
                <input
                  type="number"
                  placeholder="contoh: 1"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary"
                  required
                  min="0"
                />
                <p className="text-[10px] text-secondary/60">
                  Angka lebih kecil akan ditampilkan lebih dahulu.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">
                  Deskripsi Kategori
                </label>
                <textarea
                  rows={4}
                  placeholder="Deskripsi singkat kategori ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 uppercase tracking-widest py-5 rounded-none font-bold text-white cursor-pointer"
                >
                  {isPending ? "Menyimpan..." : editId ? "Perbarui" : "Tambah"}
                </Button>
                {editId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="uppercase tracking-widest py-5 px-4 rounded-none font-bold cursor-pointer"
                  >
                    Batal
                  </Button>
                )}
              </div>
            </form>

            {/* List Column (Right Panel) */}
            <div className="lg:col-span-8 border border-border/40 bg-card p-6 rounded-none space-y-6">
              <h3 className="font-serif text-lg text-primary font-semibold flex items-center justify-between pb-3 border-b border-border/20">
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Kategori Terdaftar
                </span>
                <span className="font-sans text-xs text-secondary font-light">
                  Menampilkan {filteredCategories.length} dari {categories.length} kategori
                </span>
              </h3>

              {/* Booking Type Filter Tab Bar */}
              <div className="flex flex-wrap gap-1.5 pb-2">
                <Button
                  key="ALL"
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterBookingType("ALL")}
                  className={cn(
                    "text-[10px] uppercase tracking-wider rounded-none transition-all duration-200 h-8 px-3 cursor-pointer",
                    filterBookingType === "ALL"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-secondary hover:text-primary hover:border-primary/50"
                  )}
                >
                  Semua
                </Button>
                <Button
                  key="DATE_ONLY"
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterBookingType("DATE_ONLY")}
                  className={cn(
                    "text-[10px] uppercase tracking-wider rounded-none transition-all duration-200 h-8 px-3 cursor-pointer",
                    filterBookingType === "DATE_ONLY"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-secondary hover:text-primary hover:border-primary/50"
                  )}
                >
                  Harian (DATE_ONLY)
                </Button>
                <Button
                  key="TIME_BASED"
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterBookingType("TIME_BASED")}
                  className={cn(
                    "text-[10px] uppercase tracking-wider rounded-none transition-all duration-200 h-8 px-3 cursor-pointer",
                    filterBookingType === "TIME_BASED"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-secondary hover:text-primary hover:border-primary/50"
                  )}
                >
                  Per Jam (TIME_BASED)
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse font-sans text-xs">
                  <thead>
                    <tr className="border-b border-border/40 text-left text-secondary font-bold uppercase tracking-wider">
                      <th className="pb-3 pr-4 font-bold text-[10px] w-[80px]">Urutan</th>
                      <th className="pb-3 pr-4 font-bold text-[10px]">Nama Internal</th>
                      <th className="pb-3 pr-4 font-bold text-[10px]">Label Publik</th>
                      <th className="pb-3 pr-4 font-bold text-[10px]">Prefix ID</th>
                      <th className="pb-3 pr-4 font-bold text-[10px] w-[110px]">Tipe Booking</th>
                      <th className="pb-3 pr-4 font-bold text-[10px] hidden md:table-cell">Deskripsi</th>
                      <th className="pb-3 pr-4 font-bold text-[10px] text-center w-[80px]">Paket</th>
                      <th className="pb-3 text-right w-[100px]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((cat) => (
                      <tr
                        key={cat.id}
                        className={`border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors ${
                          editId === cat.id ? "bg-muted/50" : ""
                        }`}
                      >
                        <td className="py-4 pr-4 text-primary font-mono">{cat.order}</td>
                        <td className="py-4 pr-4">
                          <span className="inline-flex items-center gap-1 bg-secondary/15 text-primary px-2 py-0.5 rounded-none font-mono text-[10px] font-bold">
                            <Tag className="w-2.5 h-2.5" />
                            {cat.name}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-primary font-semibold">{cat.label}</td>
                        <td className="py-4 pr-4">
                          <span className="inline-flex items-center bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-none font-mono text-[10px] font-bold uppercase tracking-wider">
                            {cat.code || "CAT"}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-wider ${
                            cat.bookingType === "TIME_BASED" 
                              ? "bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300"
                              : "bg-neutral-100 dark:bg-neutral-800/40 text-secondary"
                          }`}>
                            {cat.bookingType === "TIME_BASED" ? "Per Jam" : "Harian"}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-secondary hidden md:table-cell max-w-[250px] truncate">
                          {cat.description || <span className="italic text-secondary/40">Tanpa deskripsi</span>}
                        </td>
                        <td className="py-4 pr-4 text-center text-primary font-bold">
                          {cat._count?.packages || 0}
                        </td>
                        <td className="py-4 text-right space-x-1">
                          <Button
                            onClick={() => handleEditClick(cat)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:bg-muted cursor-pointer"
                            title="Edit Kategori"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(cat.id, cat.label)}
                            disabled={isPending}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-700 hover:bg-red-50 hover:text-red-800 cursor-pointer"
                            title="Hapus Kategori"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {filteredCategories.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-16 text-secondary italic">
                          Tidak ada kategori terdaftar yang cocok dengan filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
