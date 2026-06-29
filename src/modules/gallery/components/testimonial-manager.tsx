"use client";

import { useState, useTransition } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminHeader } from "@/components/admin-header";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
} from "../actions/testimonial-admin.action";
import { Trash2, Plus, MessageSquare, AlertCircle, UploadCloud, Edit3, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/modal-provider";
import { toast } from "sonner";
import { createClient } from "@/src/infrastructure/supabase/client";

interface TestimonialItem {
  id: string;
  name: string;
  role: string | null;
  content: string;
  avatarUrl: string | null;
  storagePath: string | null;
}

interface TestimonialManagerProps {
  initialTestimonials: TestimonialItem[];
}

export function TestimonialManager({ initialTestimonials }: TestimonialManagerProps) {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(initialTestimonials);
  const [isPending, startTransition] = useTransition();
  const { alert, confirm } = useModal();

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Form States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredTestimonials = testimonials.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      (item.role && item.role.toLowerCase().includes(searchLower))
    );
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      setPreviewUrl(
        editingId !== null
          ? testimonials.find((item) => item.id === editingId)?.avatarUrl || null
          : null
      );
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setError("Tipe file tidak didukung. Harap pilih gambar/foto.");
      setFile(null);
      setPreviewUrl(
        editingId !== null
          ? testimonials.find((item) => item.id === editingId)?.avatarUrl || null
          : null
      );
      return;
    }

    const maxSize = 20 * 1024 * 1024; // 20MB
    if (selectedFile.size > maxSize) {
      setError("Ukuran file terlalu besar. Maksimal untuk gambar adalah 20 MB.");
      setFile(null);
      setPreviewUrl(
        editingId !== null
          ? testimonials.find((item) => item.id === editingId)?.avatarUrl || null
          : null
      );
      return;
    }

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const handleCancel = () => {
    setEditingId(null);
    setName("");
    setRole("");
    setContent("");
    setFile(null);
    setPreviewUrl(null);
    setError(null);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleStartEdit = (item: TestimonialItem) => {
    setEditingId(item.id);
    setName(item.name);
    setRole(item.role || "");
    setContent(item.content);
    setFile(null);
    setPreviewUrl(item.avatarUrl);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !content) {
      setError("Nama lengkap dan isi testimoni wajib diisi.");
      return;
    }

    startTransition(async () => {
      try {
        let avatarUrl: string | null = null;
        let storagePath: string | null = null;

        const supabase = createClient();

        if (file) {
          try {
            const { compressImage } = await import("@/lib/image-compress");
            const compressedFile = await compressImage(file, 400, 0.8);
            
            const uuid = window.crypto.randomUUID();
            storagePath = `images/testimonials/${uuid}.webp`;

            const { error: uploadError } = await supabase.storage
              .from("portfolio")
              .upload(storagePath, compressedFile, {
                contentType: "image/webp",
                cacheControl: "31536000",
                upsert: false,
              });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from("portfolio")
              .getPublicUrl(storagePath);

            avatarUrl = publicUrl;
          } catch (err: any) {
            console.error("Error uploading avatar:", err);
            throw new Error(`Gagal mengunggah foto profil: ${err.message || err}`);
          }
        }

        let response;
        if (editingId !== null) {
          const existingItem = testimonials.find((item) => item.id === editingId);
          
          response = await updateTestimonialAction(editingId, {
            name,
            role: role || null,
            content,
            ...(avatarUrl ? { avatarUrl, storagePath } : {}),
          });

          if (response.success && response.data) {
            // Delete old file if new one was uploaded
            if (file && existingItem?.storagePath) {
              await supabase.storage.from("portfolio").remove([existingItem.storagePath]).catch((err) => {
                console.error("Error deleting old avatar:", err);
              });
            }
          }
        } else {
          response = await createTestimonialAction({
            name,
            role: role || null,
            content,
            avatarUrl,
            storagePath,
          });
        }

        if (response.success && response.data) {
          if (editingId !== null) {
            setTestimonials((prev) =>
              prev.map((item) =>
                item.id === editingId ? (response.data as TestimonialItem) : item
              )
            );
            toast.success("Testimoni berhasil diperbarui!");
          } else {
            setTestimonials((prev) => [response.data as TestimonialItem, ...prev]);
            toast.success("Testimoni baru berhasil ditambahkan!");
          }
          handleCancel();
        } else {
          setError(response.error || "Gagal menyimpan testimoni.");
        }
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan sistem.");
      }
    });
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm(
      "Apakah Anda yakin ingin menghapus testimoni ini secara permanen dari database dan storage?"
    );
    if (!isConfirmed) return;

    startTransition(async () => {
      const response = await deleteTestimonialAction(id);
      if (response.success) {
        setTestimonials((prev) => prev.filter((item) => item.id !== id));
        if (editingId === id) {
          handleCancel();
        }
        toast.success("Testimoni berhasil dihapus.");
      } else {
        await alert(response.error || "Gagal menghapus testimoni.");
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
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-medium">CMS Testimoni</h2>
            <p className="font-sans text-sm text-secondary font-light">
              Kelola testimoni dan ulasan dari klien yang akan ditampilkan pada halaman beranda.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Column (Left 4 cols) */}
            <form
              onSubmit={handleSubmit}
              className="lg:col-span-4 border border-border/40 bg-card p-6 space-y-5 rounded-none font-sans text-xs"
            >
              <h3 className="font-serif text-lg text-primary mb-4 font-semibold flex items-center gap-2 pb-3 border-b border-border/20">
                {editingId !== null ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingId !== null ? "Edit Testimoni" : "Tambah Testimoni"}
              </h3>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-800 flex items-center gap-2 text-[10px]">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="uppercase tracking-wider text-secondary font-bold block"
                >
                  Nama Klien *
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="contoh: Eleanor & James"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary"
                  required
                />
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label
                  htmlFor="role"
                  className="uppercase tracking-wider text-secondary font-bold block"
                >
                  Peran / Kategori Acara (Opsional)
                </label>
                <input
                  type="text"
                  id="role"
                  placeholder="contoh: Pernikahan Destinasi di Tuscany"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary"
                />
              </div>

              {/* Upload Avatar Image */}
              <div className="space-y-1.5">
                <label className="uppercase tracking-wider text-secondary font-bold block">
                  {editingId !== null ? "Ganti Foto Profil (Opsional)" : "Foto Profil Klien (Opsional)"}
                </label>
                <div className="relative border border-dashed border-border/60 p-4 hover:border-primary/50 transition-colors flex flex-col items-center justify-center text-center bg-muted/10 cursor-pointer">
                  <UploadCloud className="w-8 h-8 text-secondary/60 mb-2" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                  <span className="text-[10px] text-primary font-semibold">
                    Klik / seret file untuk memilih
                  </span>
                  <span className="text-[9px] text-secondary mt-1">Image WebP/JPG/PNG (max 20MB)</span>
                </div>

                {file && (
                  <div className="mt-2 text-[10px] text-secondary/80 font-mono flex items-center justify-between bg-muted/30 p-2">
                    <span className="truncate max-w-[180px]">{file.name}</span>
                    <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                )}

                {previewUrl && (
                  <div className="mt-3 border border-border/20 w-24 h-24 rounded-full overflow-hidden bg-neutral-50 flex items-center justify-center mx-auto">
                    <img src={previewUrl} alt="Preview Avatar" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <label
                  htmlFor="content"
                  className="uppercase tracking-wider text-secondary font-bold block"
                >
                  Isi Testimoni *
                </label>
                <textarea
                  id="content"
                  rows={6}
                  placeholder="Masukkan ulasan dan kesan pesan dari klien..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary resize-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full uppercase tracking-widest py-5 rounded-none font-bold text-white cursor-pointer"
                >
                  {isPending ? "Memproses..." : editingId !== null ? "Perbarui & Simpan" : "Tambah & Simpan"}
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-border/20">
                <h3 className="font-serif text-lg text-primary font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Daftar Testimoni Terdaftar ({filteredTestimonials.length !== testimonials.length ? `${filteredTestimonials.length} dari ${testimonials.length}` : testimonials.length})
                </h3>
                {/* Search Input */}
                <div className="relative font-sans text-xs min-w-[200px] sm:min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary/60" />
                  <input
                    type="text"
                    placeholder="Cari nama atau peran..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {filteredTestimonials.map((item) => (
                  <div
                    key={item.id}
                    className="border border-white/40 bg-card/20 backdrop-blur-sm p-6 flex flex-col justify-start rounded-none hover:border-primary/40 transition-all duration-500 shadow-sm relative overflow-hidden group h-auto self-start"
                  >
                    {/* Blurred Profile Photo Background */}
                    {item.avatarUrl ? (
                      <div
                        className="absolute inset-0 z-0 bg-cover bg-center blur-[1px] opacity-45 scale-100 transition-transform duration-1000 group-hover:scale-105 pointer-events-none"
                        style={{ backgroundImage: `url("${item.avatarUrl}")` }}
                      />
                    ) : (
                      <div className="absolute inset-0 z-0 bg-gradient-to-b from-neutral-100/50 to-transparent opacity-20 dark:from-neutral-800/30 pointer-events-none" />
                    )}

                    {/* Subtle vignette inner overlay */}
                    <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-card/5 to-card/50 opacity-40 pointer-events-none" />

                    {/* Admin Quick Action Floating Buttons (Top Right) */}
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-card/90 backdrop-blur-md border border-border/30 p-1 shadow-sm">
                      <Button
                        onClick={() => handleStartEdit(item)}
                        disabled={isPending}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-blue-600 hover:bg-blue-50 hover:text-blue-700 cursor-pointer rounded-none"
                        title="Edit Testimoni"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(item.id)}
                        disabled={isPending}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-700 hover:bg-red-50 hover:text-red-800 cursor-pointer rounded-none"
                        title="Hapus Testimoni"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="w-full relative z-10 flex flex-col text-center h-auto pt-2">
                      {/* Client Info Block - Centered at the top */}
                      <div className="flex flex-col items-center gap-3 pb-4 border-b border-border/15 mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-100/80 border border-border/40 flex-shrink-0 flex items-center justify-center shadow-sm">
                          {item.avatarUrl ? (
                            <img
                              src={item.avatarUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-secondary/50" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-serif text-sm font-semibold text-primary">
                            {item.name}
                          </h4>
                          {item.role && (
                            <p className="text-[10px] text-secondary font-medium tracking-wide mt-0.5">
                              {item.role}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Content block below - scrollable without scrollbar if long */}
                      <div className="bg-card/85 backdrop-blur-md border border-border/20 p-4 rounded-none shadow-sm text-center h-auto max-h-[260px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        <p className="font-sans text-xs text-secondary italic leading-relaxed break-words">
                          "{item.content}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTestimonials.length === 0 && (
                <div className="text-center py-16 text-secondary font-sans text-xs italic">
                  {testimonials.length === 0
                    ? "Belum ada testimoni terdaftar."
                    : "Tidak ditemukan testimoni yang cocok dengan kata kunci pencarian."}
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
