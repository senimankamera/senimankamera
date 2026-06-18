"use client";

import { useState, useTransition } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { createPackageAction, updatePackageAction, deletePackageAction } from "../actions/package-admin.action";
import { Trash2, Plus, Settings, AlertCircle, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/modal-provider";
import { toast } from "sonner";

interface CategoryItem {
  id: string;
  name: string;
  label: string;
  bookingType?: string;
}

interface PackageItem {
  id: string;
  name: string;
  categoryId: string;
  category?: CategoryItem | null;
  price: number;
  features: string[];
  description: string | null;
  sessionDuration: number | null;
}

interface PackageManagerProps {
  initialPackages: PackageItem[];
  initialCategories: CategoryItem[];
}

export function PackageManager({ initialPackages, initialCategories }: PackageManagerProps) {
  const [packages, setPackages] = useState<PackageItem[]>(initialPackages);
  const [isPending, startTransition] = useTransition();
  const { alert, confirm } = useModal();

  // Form States
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(initialCategories[0]?.id || "");
  const [price, setPrice] = useState("");
  const [features, setFeatures] = useState("");
  const [description, setDescription] = useState("");
  const [sessionDuration, setSessionDuration] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedCategoryObj = initialCategories.find((cat) => cat.id === category);
  const isTimeBased = selectedCategoryObj?.bookingType === "TIME_BASED";

  const resetForm = () => {
    setEditId(null);
    setName("");
    setCategory(initialCategories[0]?.id || "");
    setPrice("");
    setFeatures("");
    setDescription("");
    setSessionDuration("");
    setError(null);
  };

  const handleEditClick = (pkg: PackageItem) => {
    setEditId(pkg.id);
    setName(pkg.name);
    setCategory(pkg.categoryId);
    setPrice(pkg.price.toString());
    setFeatures(pkg.features.join("\n"));
    setDescription(pkg.description || "");
    setSessionDuration(pkg.sessionDuration ? pkg.sessionDuration.toString() : "");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceNum = parseFloat(price);
    if (!name || !category || isNaN(priceNum) || !features) {
      setError("Semua field wajib diisi (Nama, Kategori, Harga, Fitur).");
      return;
    }

    // Split features by comma or newline
    const featuresList = features
      .split(/[\n,]+/)
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    if (featuresList.length === 0) {
      setError("Tulis minimal 1 fitur/fasilitas paket.");
      return;
    }

    const sessionDurationNum = isTimeBased ? parseInt(sessionDuration) : null;
    if (isTimeBased && (isNaN(sessionDurationNum!) || sessionDurationNum! <= 0)) {
      setError("Durasi sesi wajib diisi dengan angka positif untuk kategori Multi-Sesi.");
      return;
    }

    startTransition(async () => {
      if (editId) {
        // Edit Mode
        const response = await updatePackageAction(editId, {
          name,
          categoryId: category,
          price: priceNum,
          features: featuresList,
          description: description || undefined,
          sessionDuration: sessionDurationNum,
        });

        if (response.success && response.data) {
          const updatedPkg = response.data as PackageItem;
          setPackages((prev) =>
            prev.map((item) => (item.id === editId ? updatedPkg : item))
          );
          toast.success("Paket berhasil diperbarui.");
          resetForm();
        } else {
          setError(response.error || "Gagal memperbarui paket.");
        }
      } else {
        // Create Mode
        const response = await createPackageAction({
          name,
          categoryId: category,
          price: priceNum,
          features: featuresList,
          description: description || undefined,
          sessionDuration: sessionDurationNum,
        });

        if (response.success && response.data) {
          setPackages((prev) => [...prev, response.data as PackageItem]);
          toast.success("Paket baru berhasil ditambahkan.");
          resetForm();
        } else {
          setError(response.error || "Gagal menambahkan paket.");
        }
      }
    });
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm("Apakah Anda yakin ingin menghapus paket harga ini?");
    if (!isConfirmed) return;

    startTransition(async () => {
      const response = await deletePackageAction(id);
      if (response.success) {
        setPackages((prev) => prev.filter((item) => item.id !== id));
        toast.success("Paket berhasil dihapus.");
      } else {
        await alert(response.error || "Gagal menghapus paket.");
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
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-medium">CMS Paket</h2>
            <p className="font-sans text-sm text-secondary font-light">Tambah dan hapus pilihan paket beserta pricelist landing page Anda.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Form Column */}
            <form onSubmit={handleSubmit} className="lg:col-span-4 border border-border/40 bg-card p-6 space-y-5 rounded-none font-sans text-xs">
              <h3 className="font-serif text-lg text-primary mb-4 font-semibold flex items-center justify-between pb-3 border-b border-border/20">
                <span className="flex items-center gap-2">
                  {editId ? <Settings className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editId ? "Edit Paket" : "Tambah Paket Baru"}
                </span>
                {editId && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={resetForm}
                    className="h-6 w-6 p-0 text-secondary hover:text-primary cursor-pointer animate-[fadeIn_0.2s_ease-out]"
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

              {/* Package Name */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">Nama Paket</label>
                <input
                  type="text"
                  placeholder="contoh: Signature Wedding Gold"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">Kategori Acara</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary appearance-none cursor-pointer"
                >
                  {initialCategories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-background text-primary">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">Harga (IDR)</label>
                <input
                  type="number"
                  placeholder="contoh: 15000000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary"
                  required
                />
              </div>



              {/* Session Duration (conditionally rendered for TIME_BASED categories) */}
              {isTimeBased && (
                <div className="space-y-1.5 animate-[fadeIn_0.2s_ease-out]">
                  <label className="uppercase tracking-wider text-secondary font-bold block">Durasi Sesi (Menit)</label>
                  <input
                    type="number"
                    placeholder="contoh: 60, 90, 120"
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary"
                    required={isTimeBased}
                    min="1"
                  />
                  <p className="text-[10px] text-secondary/60">
                    Durasi dalam menit. Digunakan untuk menghitung tabrakan jadwal booking.
                  </p>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi ringkas mengenai paket ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary resize-none"
                />
              </div>

              {/* Features */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">Inklusi & Fitur (Pisahkan dengan baris baru)</label>
                <textarea
                  rows={5}
                  placeholder="Hingga 10 jam liputan&#10;Dua fotografer utama&#10;800+ foto hasil color-grade"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary resize-none"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 uppercase tracking-widest py-5 rounded-none font-bold text-white cursor-pointer"
                >
                  {isPending ? "Menyimpan..." : editId ? "Simpan" : "Tambah Paket"}
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

            {/* List Column */}
            <div className="lg:col-span-8 border border-border/40 bg-card p-6 rounded-none space-y-6">
              <h3 className="font-serif text-lg text-primary font-semibold flex items-center gap-2 pb-3 border-b border-border/20">
                <Settings className="w-4 h-4" /> Paket Terdaftar ({packages.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {packages.map((pkg) => {
                  return (
                    <div
                      key={pkg.id}
                      className="border border-border/40 flex flex-col justify-between p-6 bg-background relative shadow-sm"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <span className="font-sans text-[8px] uppercase tracking-widest text-primary border border-primary px-2 py-0.5 font-bold">
                            {pkg.category?.label || "Kategori"}
                          </span>
                          {pkg.sessionDuration && (
                            <span className="font-sans text-[8px] uppercase tracking-widest text-blue-800 bg-blue-100 dark:text-blue-300 dark:bg-blue-950/40 px-2 py-0.5 font-bold">
                              {pkg.sessionDuration} Menit
                            </span>
                          )}
                        </div>
                        
                        <h4 className="font-serif text-lg font-semibold text-primary mb-2">{pkg.name}</h4>
                        
                        {pkg.description && (
                          <p className="font-sans text-xs text-secondary/70 mb-4 font-light leading-relaxed">
                            {pkg.description}
                          </p>
                        )}

                        <div className="text-xl font-serif text-primary mb-4 pb-3 border-b border-border/20 font-medium">
                          {"Rp. " + pkg.price.toLocaleString("id-ID")}
                        </div>

                        <ul className="space-y-2 font-sans text-[11px] text-secondary">
                          {pkg.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <span className="w-1 h-1 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-4 border-t border-border/20 mt-6 flex justify-end gap-1">
                        <Button
                          onClick={() => handleEditClick(pkg)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary hover:bg-muted cursor-pointer"
                          title="Edit Paket"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(pkg.id)}
                          disabled={isPending}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-700 hover:bg-red-50 hover:text-red-800 cursor-pointer"
                          title="Hapus Paket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {packages.length === 0 && (
                <div className="text-center py-16 text-secondary font-sans text-xs italic">
                  Belum ada paket terdaftar.
                </div>
              )}
            </div>

          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
