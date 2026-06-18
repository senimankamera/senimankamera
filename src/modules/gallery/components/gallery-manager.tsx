"use client";

import { useState, useTransition } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { uploadMediaAction } from "../actions/upload-media.action";
import { deleteGalleryAction, updateGalleryAction } from "../actions/gallery-admin.action";
import { Trash2, Plus, Image as ImageIcon, AlertCircle, FileVideo, UploadCloud, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/modal-provider";
import { toast } from "sonner";

interface CategoryItem {
  id: string;
  name: string;
  label: string;
}

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  subCategory: string;
  imageUrl: string;
  aspect: string;
  description: string | null;
  mediaType?: string | null;
  storagePath?: string | null;
}

interface GalleryManagerProps {
  initialGalleries: GalleryItem[];
  initialCategories: CategoryItem[];
}

export function GalleryManager({ initialGalleries, initialCategories }: GalleryManagerProps) {
  const [galleries, setGalleries] = useState<GalleryItem[]>(initialGalleries);
  const [isPending, startTransition] = useTransition();
  const { alert, confirm } = useModal();

  // Form States
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(initialCategories[0]?.name || "Wedding");
  const [subCategory, setSubCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [aspect, setAspect] = useState("portrait");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      setPreviewUrl(editingId !== null ? galleries.find(item => item.id === editingId)?.imageUrl || null : null);
      return;
    }

    const isImg = selectedFile.type.startsWith("image/");
    const isVid = selectedFile.type.startsWith("video/");

    if (!isImg && !isVid) {
      setError("Tipe file tidak didukung. Harap pilih gambar atau video.");
      setFile(null);
      setPreviewUrl(editingId !== null ? galleries.find(item => item.id === editingId)?.imageUrl || null : null);
      return;
    }

    const maxSize = isImg ? 20 * 1024 * 1024 : 100 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError(`Ukuran file terlalu besar. Maksimal untuk ${isImg ? "gambar adalah 20 MB" : "video adalah 100 MB"}.`);
      setFile(null);
      setPreviewUrl(editingId !== null ? galleries.find(item => item.id === editingId)?.imageUrl || null : null);
      return;
    }

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const handleCancel = () => {
    setEditingId(null);
    setTitle("");
    setCategory(initialCategories[0]?.name || "Wedding");
    setSubCategory("");
    setFile(null);
    setPreviewUrl(null);
    setDescription("");
    setError(null);

    // Reset file input element
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleStartEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setCategory(item.category);
    setSubCategory(item.subCategory);
    setAspect(item.aspect);
    setDescription(item.description || "");
    setFile(null);
    setPreviewUrl(item.imageUrl);
    setError(null);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !category || !subCategory || !aspect) {
      setError("Semua field teks wajib diisi.");
      return;
    }

    if (editingId === null && !file) {
      setError("Media portofolio wajib diunggah untuk portofolio baru.");
      return;
    }

    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }
    formData.append("title", title);
    formData.append("category", category);
    formData.append("subCategory", subCategory);
    formData.append("aspect", aspect);
    if (description) {
      formData.append("description", description);
    }
    if (editingId !== null) {
      formData.append("id", editingId.toString());
    }

    startTransition(async () => {
      let response;
      if (editingId !== null) {
        response = await updateGalleryAction(formData);
      } else {
        response = await uploadMediaAction(formData);
      }

      if (response.success && response.data) {
        if (editingId !== null) {
          setGalleries((prev) =>
            prev.map((item) => (item.id === editingId ? (response.data as GalleryItem) : item))
          );
          toast.success("Portofolio berhasil diperbarui!");
        } else {
          setGalleries((prev) => [...prev, response.data as GalleryItem]);
          toast.success("Portofolio baru berhasil diunggah!");
        }
        handleCancel();
      } else {
        setError(response.error || "Gagal menyimpan portofolio.");
      }
    });
  };

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm("Apakah Anda yakin ingin menghapus item portofolio ini dari database dan storage?");
    if (!isConfirmed) return;

    startTransition(async () => {
      const response = await deleteGalleryAction(id);
      if (response.success) {
        setGalleries((prev) => prev.filter((item) => item.id !== id));
        if (editingId === id) {
          handleCancel();
        }
        toast.success("Portofolio berhasil dihapus.");
      } else {
        await alert(response.error || "Gagal menghapus item.");
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
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-medium">CMS Galeri</h2>
            <p className="font-sans text-sm text-secondary font-light">Kelola portofolio foto dan video landing page menggunakan Cloud Storage Supabase.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Form Column (Left 4 cols) */}
            <form onSubmit={handleAdd} className="lg:col-span-4 border border-border/40 bg-card p-6 space-y-5 rounded-none font-sans text-xs">
              <h3 className="font-serif text-lg text-primary mb-4 font-semibold flex items-center gap-2 pb-3 border-b border-border/20">
                {editingId !== null ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingId !== null ? "Edit Portofolio" : "Unggah Portofolio"}
              </h3>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-800 flex items-center gap-2 text-[10px]">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">Judul Portofolio *</label>
                <input
                  type="text"
                  placeholder="contoh: Quiet Confidence"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary"
                  required
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">Kategori *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary appearance-none cursor-pointer"
                >
                  {initialCategories.map((cat) => (
                    <option key={cat.id} value={cat.name} className="bg-background text-primary">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* SubCategory */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">Sub Kategori (Tag Info) *</label>
                <input
                  type="text"
                  placeholder="contoh: Pernikahan • Detail"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary"
                  required
                />
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">Rasio Dimensi Tampilan *</label>
                <select
                  value={aspect}
                  onChange={(e) => setAspect(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary appearance-none cursor-pointer"
                >
                  <option value="portrait" className="bg-background text-primary">Portrait (Tinggi)</option>
                  <option value="square" className="bg-background text-primary">Square (Kotak)</option>
                  <option value="wide" className="bg-background text-primary">Wide (Lebar)</option>
                </select>
              </div>

              {/* Upload Media File */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">
                  {editingId !== null ? "Ganti Media File (Opsional)" : "Unggah Media File *"}
                </label>
                <div className="relative border border-dashed border-border/60 p-4 hover:border-primary/50 transition-colors flex flex-col items-center justify-center text-center bg-muted/10 cursor-pointer">
                  <UploadCloud className="w-8 h-8 text-secondary/60 mb-2" />
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    required={editingId === null}
                  />
                  <span className="text-[10px] text-primary font-semibold">Klik / seret file untuk memilih</span>
                  <span className="text-[9px] text-secondary mt-1">Image (max 20MB) / Video (max 100MB)</span>
                </div>

                {file && (
                  <div className="mt-2 text-[10px] text-secondary/80 font-mono flex items-center justify-between bg-muted/30 p-2">
                    <span className="truncate max-w-[180px]">{file.name}</span>
                    <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                )}

                {previewUrl && (
                  <div className="mt-3 border border-border/20 aspect-[4/3] relative overflow-hidden bg-neutral-50 flex items-center justify-center">
                    {(file ? file.type.startsWith("video/") : (editingId !== null && (galleries.find(item => item.id === editingId)?.mediaType === "video" || galleries.find(item => item.id === editingId)?.imageUrl.endsWith(".mp4")))) ? (
                      <video src={previewUrl} className="w-full h-full object-cover" muted controls />
                    ) : (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">Deskripsi (Opsional)</label>
                <textarea
                  rows={3}
                  placeholder="Cerita singkat portofolio..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary resize-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full uppercase tracking-widest py-5 rounded-none font-bold text-white cursor-pointer"
                >
                  {isPending ? "Memproses..." : (editingId !== null ? "Perbarui & Simpan" : "Unggah & Simpan")}
                </Button>
                {editingId !== null && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isPending}
                    className="w-full uppercase tracking-widest py-4 rounded-none font-bold cursor-pointer text-secondary"
                  >
                    Batal Edit
                  </Button>
                )}
              </div>
            </form>

            {/* List Column (Right 8 cols) */}
            <div className="lg:col-span-8 border border-border/40 bg-card p-6 rounded-none space-y-6">
              <h3 className="font-serif text-lg text-primary font-semibold flex items-center gap-2 pb-3 border-b border-border/20">
                <ImageIcon className="w-4 h-4" /> Daftar Portofolio Terdaftar ({galleries.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {galleries.map((item) => {
                  const isVideo = item.mediaType === "video" || item.imageUrl.endsWith(".mp4") || item.imageUrl.includes("/videos/");
                  const cat = initialCategories.find(c => c.name.toLowerCase() === item.category.toLowerCase());
                  const displayName = cat ? cat.label : item.category;

                  return (
                    <div
                      key={item.id}
                      className="border border-border/40 group flex flex-col justify-between relative bg-background overflow-hidden p-3"
                    >
                      <div className="space-y-3">
                        {/* Image/Video Thumbnail */}
                        <div className="w-full aspect-[4/3] overflow-hidden bg-neutral-100 border border-border/20 relative flex items-center justify-center">
                          {isVideo ? (
                            <div className="w-full h-full relative">
                              <video
                                src={item.imageUrl}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                muted
                                loop
                                playsInline
                              />
                              <div className="absolute top-2 right-2 bg-black/60 p-1 rounded-full text-white">
                                <FileVideo className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          )}
                          <span className="absolute top-2 left-2 bg-primary text-white text-[9px] uppercase tracking-wider px-2 py-0.5 font-bold font-sans">
                            {displayName}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="font-sans text-xs">
                          <h4 className="font-serif text-sm font-semibold text-primary mb-1">{item.title}</h4>
                          <p className="text-secondary/80 text-[10px] font-medium tracking-wide">{item.subCategory}</p>
                          <p className="text-secondary/50 text-[9px] uppercase mt-0.5">
                            Tipe: {isVideo ? "Video" : "Gambar Webp"} • Rasio: {item.aspect === "portrait" ? "Portrait" : item.aspect === "square" ? "Square" : "Wide"}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border/20 mt-3 flex justify-end gap-2">
                        <Button
                          onClick={() => handleStartEdit(item)}
                          disabled={isPending}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                          title="Edit Portofolio"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(item.id)}
                          disabled={isPending}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-700 hover:bg-red-50 hover:text-red-800 cursor-pointer"
                          title="Hapus Portofolio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {galleries.length === 0 && (
                <div className="text-center py-16 text-secondary font-sans text-xs italic">
                  Belum ada item portofolio di galeri.
                </div>
              )}
            </div>

          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
