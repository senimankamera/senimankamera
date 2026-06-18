"use client";

import { useState, useTransition } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "../actions/category-admin.action";
import { Trash2, Plus, Edit2, AlertCircle, Tag, Settings, X, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/modal-provider";
import { toast } from "sonner";

interface CategoryItem {
  id: string;
  name: string;
  label: string;
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
  const [isPending, startTransition] = useTransition();
  const { alert, confirm } = useModal();

  // Form States
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("0");
  const [bookingType, setBookingType] = useState("DATE_ONLY");
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setEditId(null);
    setName("");
    setLabel("");
    setDescription("");
    setOrder("0");
    setBookingType("DATE_ONLY");
    setError(null);
  };

  const handleEditClick = (cat: CategoryItem) => {
    setEditId(cat.id);
    setName(cat.name);
    setLabel(cat.label);
    setDescription(cat.description || "");
    setOrder(cat.order.toString());
    setBookingType(cat.bookingType || "DATE_ONLY");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const orderNum = parseInt(order);
    if (!name || !label || isNaN(orderNum)) {
      setError("Field Nama, Label, dan Urutan wajib diisi.");
      return;
    }

    // Casing check: internal name usually alphanumeric
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      setError("Nama internal hanya boleh berisi huruf, angka, dash (-), dan underscore (_).");
      return;
    }

    startTransition(async () => {
      if (editId) {
        // Edit Mode
        const response = await updateCategoryAction(editId, {
          name,
          label,
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
        
        {/* Header App Bar */}
        <header className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-border/40 bg-background sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-secondary hover:text-primary transition-colors" />
            <span className="font-sans text-[10px] uppercase tracking-widest text-secondary font-bold hidden md:block">
              Manajemen Studio Seniman Kamera
            </span>
          </div>
        </header>

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
                  <option value="TIME_BASED" className="bg-card text-primary">Banyak Booking per Tanggal / Multi-Sesi (TIME_BASED)</option>
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
              <h3 className="font-serif text-lg text-primary font-semibold flex items-center gap-2 pb-3 border-b border-border/20">
                <Settings className="w-4 h-4" /> Kategori Terdaftar ({categories.length})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse font-sans text-xs">
                  <thead>
                    <tr className="border-b border-border/40 text-left text-secondary font-bold uppercase tracking-wider">
                      <th className="pb-3 pr-4 font-bold text-[10px] w-[80px]">Urutan</th>
                      <th className="pb-3 pr-4 font-bold text-[10px]">Nama Internal</th>
                      <th className="pb-3 pr-4 font-bold text-[10px]">Label Publik</th>
                      <th className="pb-3 pr-4 font-bold text-[10px] w-[110px]">Tipe Booking</th>
                      <th className="pb-3 pr-4 font-bold text-[10px] hidden md:table-cell">Deskripsi</th>
                      <th className="pb-3 pr-4 font-bold text-[10px] text-center w-[80px]">Paket</th>
                      <th className="pb-3 text-right w-[100px]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
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
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-wider ${
                            cat.bookingType === "TIME_BASED" 
                              ? "bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300"
                              : "bg-neutral-100 dark:bg-neutral-800/40 text-secondary"
                          }`}>
                            {cat.bookingType === "TIME_BASED" ? "Multi-Sesi" : "Harian"}
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
                    {categories.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-secondary italic">
                          Belum ada kategori terdaftar.
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
