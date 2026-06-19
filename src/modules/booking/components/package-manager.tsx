"use client";

import { useState, useTransition } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { createPackageAction, updatePackageAction, deletePackageAction } from "../actions/package-admin.action";
import { Trash2, Plus, Settings, AlertCircle, Edit2, X, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/modal-provider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function isHexColorLight(color?: string | null): boolean {
  if (!color || color === "DEFAULT") return false;
  if (color === "LIGHT") return true;
  if (color === "DARK") return false;
  
  const hex = color.replace("#", "");
  if (hex.length !== 6) return false;
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
  );

  return hsp > 127.5;
}

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
  imageUrl?: string | null;
  imageStoragePath?: string | null;
  textColor?: string | null;
  buttonColor?: string | null;
}

interface PackageManagerProps {
  initialPackages: PackageItem[];
  initialCategories: CategoryItem[];
}

export function PackageManager({ initialPackages, initialCategories }: PackageManagerProps) {
  const [packages, setPackages] = useState<PackageItem[]>(initialPackages);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();
  const { alert, confirm } = useModal();

  // Filtered packages logic
  const filteredPackages = filterCategory === "ALL"
    ? packages
    : packages.filter((pkg) => pkg.categoryId === filterCategory);

  // Form States
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(initialCategories[0]?.id || "");
  const [price, setPrice] = useState("");
  const [features, setFeatures] = useState("");
  const [description, setDescription] = useState("");
  const [sessionDuration, setSessionDuration] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textColor, setTextColor] = useState("DEFAULT");
  const [buttonColor, setButtonColor] = useState("DEFAULT");
  const [removeBg, setRemoveBg] = useState(false);
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
    setFile(null);
    setPreviewUrl(null);
    setTextColor("DEFAULT");
    setButtonColor("DEFAULT");
    setRemoveBg(false);
    setError(null);
    
    // Reset file input element
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleEditClick = (pkg: PackageItem) => {
    setEditId(pkg.id);
    setName(pkg.name);
    setCategory(pkg.categoryId);
    setPrice(pkg.price.toString());
    setFeatures(pkg.features.join("\n"));
    setDescription(pkg.description || "");
    setSessionDuration(pkg.sessionDuration ? pkg.sessionDuration.toString() : "");
    setFile(null);
    setPreviewUrl(pkg.imageUrl || null);
    setTextColor(pkg.textColor || "DEFAULT");
    setButtonColor(pkg.buttonColor || "DEFAULT");
    setRemoveBg(false);
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

    const sessionDurationNum = isTimeBased ? parseInt(sessionDuration, 10) : null;
    if (isTimeBased && (isNaN(sessionDurationNum!) || sessionDurationNum! <= 0)) {
      setError("Durasi sesi wajib diisi dengan angka positif untuk kategori Multi-Sesi.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("categoryId", category);
    formData.append("price", priceNum.toString());
    formData.append("features", features);
    if (description) {
      formData.append("description", description);
    }
    if (sessionDurationNum) {
      formData.append("sessionDuration", sessionDurationNum.toString());
    }
    formData.append("textColor", textColor);
    formData.append("buttonColor", buttonColor);
    if (file) {
      formData.append("file", file);
    }
    if (editId) {
      formData.append("id", editId);
      formData.append("removeBg", removeBg.toString());
    }

    startTransition(async () => {
      if (editId) {
        // Edit Mode
        const response = await updatePackageAction(formData);

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
        const response = await createPackageAction(formData);

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

              {/* Text Color Selection */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">Warna Font Kartu Paket</label>
                <div className="flex flex-col gap-2 p-3 border border-border/40 bg-muted/5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={textColor !== "DEFAULT"}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTextColor("#ffffff");
                        } else {
                          setTextColor("DEFAULT");
                        }
                      }}
                      className="h-4 w-4 rounded-none border-border accent-primary cursor-pointer"
                    />
                    <span className="text-secondary text-[11px] font-semibold">Gunakan Warna Kustom</span>
                  </label>

                  {textColor !== "DEFAULT" && (
                    <div className="flex items-center gap-2.5 mt-1.5 animate-[fadeIn_0.2s_ease-out]">
                      <input
                        type="color"
                        value={textColor.startsWith("#") ? textColor : "#ffffff"}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-8 h-8 p-0 border border-border/50 bg-transparent cursor-pointer rounded-none"
                      />
                      <span className="font-mono text-[10px] text-primary uppercase font-bold">{textColor}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Button Color Selection */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">Warna Tombol Kartu Paket</label>
                <div className="flex flex-col gap-2 p-3 border border-border/40 bg-muted/5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={buttonColor !== "DEFAULT"}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setButtonColor("#000000");
                        } else {
                          setButtonColor("DEFAULT");
                        }
                      }}
                      className="h-4 w-4 rounded-none border-border accent-primary cursor-pointer"
                    />
                    <span className="text-secondary text-[11px] font-semibold">Gunakan Warna Kustom</span>
                  </label>

                  {buttonColor !== "DEFAULT" && (
                    <div className="flex items-center gap-2.5 mt-1.5 animate-[fadeIn_0.2s_ease-out]">
                      <input
                        type="color"
                        value={buttonColor.startsWith("#") ? buttonColor : "#000000"}
                        onChange={(e) => setButtonColor(e.target.value)}
                        className="w-8 h-8 p-0 border border-border/50 bg-transparent cursor-pointer rounded-none"
                      />
                      <span className="font-mono text-[10px] text-primary uppercase font-bold">{buttonColor}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Background Image Upload */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">
                  {editId && previewUrl && !removeBg ? "Ganti Gambar Latar (Opsional)" : "Gambar Latar (Opsional)"}
                </label>
                <div className="relative border border-dashed border-border/60 p-4 hover:border-primary/50 transition-colors flex flex-col items-center justify-center text-center bg-muted/10 cursor-pointer">
                  <UploadCloud className="w-8 h-8 text-secondary/60 mb-2" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setError(null);
                      const selectedFile = e.target.files?.[0];
                      if (!selectedFile) {
                        setFile(null);
                        setPreviewUrl(editId && !removeBg ? packages.find(item => item.id === editId)?.imageUrl || null : null);
                        return;
                      }
                      if (!selectedFile.type.startsWith("image/")) {
                        setError("Hanya file gambar yang didukung.");
                        return;
                      }
                      if (selectedFile.size > 10 * 1024 * 1024) {
                        setError("Ukuran file gambar maksimal 10 MB.");
                        return;
                      }
                      setFile(selectedFile);
                      setRemoveBg(false);
                      setPreviewUrl(URL.createObjectURL(selectedFile));
                    }}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                  <span className="text-[10px] text-primary font-semibold">Klik / seret file untuk memilih</span>
                  <span className="text-[9px] text-secondary mt-1">Format gambar (max 10MB). Auto-crop 4:5 WebP.</span>
                </div>

                {file && (
                  <div className="mt-2 text-[10px] text-secondary/80 font-mono flex items-center justify-between bg-muted/30 p-2">
                    <span className="truncate max-w-[180px]">{file.name}</span>
                    <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                )}

                {previewUrl && !removeBg && (
                  <div className="mt-3 relative border border-border/20 aspect-[4/5] max-w-[120px] mx-auto overflow-hidden bg-neutral-50 flex items-center justify-center">
                    <img src={previewUrl} alt="Background Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setPreviewUrl(null);
                        if (editId) {
                          setRemoveBg(true);
                        }
                      }}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-none p-1 shadow-md cursor-pointer transition-colors"
                      title="Hapus gambar"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {editId && removeBg && (
                  <div className="mt-2 text-[10px] text-red-600 bg-red-50 dark:bg-red-950/20 p-2 border border-red-200/40">
                    Gambar background lama ditandai untuk dihapus.
                  </div>
                )}
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
              <h3 className="font-serif text-lg text-primary font-semibold flex items-center justify-between pb-3 border-b border-border/20">
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Paket Terdaftar
                </span>
                <span className="font-sans text-xs text-secondary font-light">
                  Menampilkan {filteredPackages.length} dari {packages.length} paket
                </span>
              </h3>

              {/* Category Filter Tab Bar */}
              <div className="flex flex-wrap gap-1.5 pb-2">
                <Button
                  key="ALL"
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterCategory("ALL")}
                  className={cn(
                    "text-[10px] uppercase tracking-wider rounded-none transition-all duration-200 h-8 px-3 cursor-pointer",
                    filterCategory === "ALL"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-secondary hover:text-primary hover:border-primary/50"
                  )}
                >
                  Semua
                </Button>
                {initialCategories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterCategory(cat.id)}
                    className={cn(
                      "text-[10px] uppercase tracking-wider rounded-none transition-all duration-200 h-8 px-3 cursor-pointer",
                      filterCategory === cat.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent text-secondary hover:text-primary hover:border-primary/50"
                    )}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPackages.map((pkg) => {
                  const hasBg = !!pkg.imageUrl;
                  const isCustomColor = pkg.textColor && pkg.textColor.startsWith("#");
                  const isWedding = pkg.category?.name.toLowerCase() === "wedding";

                  // Text styling logic:
                  // 1. If textColor is custom hex, check if it's light using isHexColorLight
                  // 2. Otherwise use standard defaults
                  const isLightText = isCustomColor 
                    ? isHexColorLight(pkg.textColor)
                    : (pkg.textColor === "LIGHT" || 
                       (pkg.textColor === "DEFAULT" && isWedding) ||
                       (!pkg.textColor && isWedding) ||
                       (hasBg && pkg.textColor !== "DARK"));

                  const customStyle = isCustomColor ? { color: pkg.textColor! } : undefined;

                  return (
                    <div
                      key={pkg.id}
                      className={cn(
                        "border border-border/40 flex flex-col justify-between p-6 relative shadow-sm overflow-hidden",
                        hasBg 
                          ? "bg-neutral-900 border-neutral-800" 
                          : isWedding
                            ? "bg-neutral-950 border-neutral-800 text-neutral-100"
                            : "bg-background text-foreground"
                      )}
                    >
                      {/* Background Image */}
                      {hasBg && (
                        <img 
                          src={pkg.imageUrl!} 
                          alt="" 
                          className="absolute inset-0 w-full h-full object-cover z-0" 
                        />
                      )}

                      <div className="relative z-10 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-3">
                            <span className={cn(
                              "font-sans text-[8px] uppercase tracking-widest px-2 py-0.5 font-bold border",
                              isLightText
                                ? "text-neutral-100 border-neutral-100/30 bg-black/30 animate-pulse"
                                : "text-primary border-primary bg-transparent"
                            )}>
                              {pkg.category?.label || "Kategori"}
                            </span>
                             <div className="flex gap-1.5 items-center flex-wrap">
                               {pkg.imageUrl && (
                                 <span className="font-sans text-[8px] uppercase tracking-widest text-emerald-800 bg-emerald-100 dark:text-emerald-350 dark:bg-emerald-950/40 px-2 py-0.5 font-bold">
                                   BG Gambar
                                 </span>
                               )}
                               {pkg.textColor && pkg.textColor !== "DEFAULT" && (
                                 <span className="font-sans text-[8px] uppercase tracking-widest text-purple-800 bg-purple-100 dark:text-purple-350 dark:bg-purple-950/40 px-2 py-0.5 font-bold">
                                   Font: {pkg.textColor.startsWith("#") ? pkg.textColor : (pkg.textColor === "LIGHT" ? "Putih" : "Hitam")}
                                 </span>
                               )}
                               {pkg.buttonColor && pkg.buttonColor !== "DEFAULT" && (
                                 <span className="font-sans text-[8px] uppercase tracking-widest text-pink-800 bg-pink-100 dark:text-pink-350 dark:bg-pink-950/40 px-2 py-0.5 font-bold">
                                   Tombol: {pkg.buttonColor}
                                 </span>
                               )}
                               {pkg.sessionDuration && (
                                 <span className="font-sans text-[8px] uppercase tracking-widest text-blue-800 bg-blue-100 dark:text-blue-300 dark:bg-blue-950/40 px-2 py-0.5 font-bold">
                                   {pkg.sessionDuration} Menit
                                 </span>
                               )}
                             </div></div>
                          
                          <h4 
                            style={customStyle}
                            className={cn("font-serif text-lg font-semibold mb-2", isLightText ? "text-white" : "text-primary")}
                          >
                            {pkg.name}
                          </h4>
                          
                          {pkg.description && (
                            <p 
                              style={isCustomColor ? { color: pkg.textColor!, opacity: 0.8 } : undefined}
                              className={cn("font-sans text-xs mb-4 font-light leading-relaxed", isLightText ? "text-neutral-300" : "text-secondary/70")}
                            >
                              {pkg.description}
                            </p>
                          )}

                          <div 
                            style={isCustomColor ? { color: pkg.textColor!, borderColor: `${pkg.textColor!}33` } : undefined}
                            className={cn("text-xl font-serif mb-4 pb-3 border-b font-medium", isLightText ? "text-white border-neutral-800" : "text-primary border-border/20")}
                          >
                            {"Rp. " + pkg.price.toLocaleString("id-ID")}
                          </div>

                          <ul className={cn("space-y-2 font-sans text-[11px]", isLightText ? "text-neutral-200" : "text-secondary")}>
                            {pkg.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2.5">
                                <span 
                                  style={isCustomColor ? { backgroundColor: pkg.textColor! } : undefined}
                                  className={cn("w-1 h-1 rounded-full flex-shrink-0 mt-1.5", isLightText ? "bg-white" : "bg-primary")} 
                                />
                                <span style={customStyle}>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className={cn("pt-4 border-t mt-6 flex justify-end gap-1", isLightText ? "border-neutral-800" : "border-border/20")}>
                          <Button
                            onClick={() => handleEditClick(pkg)}
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8 cursor-pointer rounded-none", isLightText ? "text-neutral-300 hover:bg-neutral-800 hover:text-white" : "text-primary hover:bg-muted")}
                            title="Edit Paket"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(pkg.id)}
                            disabled={isPending}
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8 cursor-pointer rounded-none", isLightText ? "text-red-400 hover:bg-red-950/40 hover:text-red-300" : "text-red-700 hover:bg-red-50 hover:text-red-800")}
                            title="Hapus Paket"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {packages.length === 0 ? (
                <div className="text-center py-16 text-secondary font-sans text-xs italic">
                  Belum ada paket terdaftar.
                </div>
              ) : filteredPackages.length === 0 ? (
                <div className="text-center py-16 text-secondary font-sans text-xs italic">
                  Tidak ada paket untuk kategori ini.
                </div>
              ) : null}
            </div>

          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
