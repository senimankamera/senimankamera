"use client";

import { useState, useTransition } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminHeader } from "@/components/admin-header";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  AlertCircle,
  Plus,
  X,
  Edit2,
  Trash2,
  Users,
  Search,
  ArrowUpDown,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useModal } from "@/components/modal-provider";
import { cn } from "@/lib/utils";

// Server Actions
import { createCustomerAction, updateCustomerAction, deleteCustomerAction } from "../actions/customer.action";

interface CustomerManagerProps {
  initialCustomers: any[];
  categories: any[];
  packages: any[];
}

export function CustomerManager({
  initialCustomers = [],
  categories = [],
  packages = [],
}: CustomerManagerProps) {
  const [customerList, setCustomerList] = useState<any[]>(initialCustomers);
  const [isPending, startTransition] = useTransition();
  const { alert, confirm } = useModal();

  // Search and Filter States
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [presenceFilter, setPresenceFilter] = useState("ALL");

  // Sorting States
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form States
  const [editId, setEditId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [instagram, setInstagram] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Reset
  const resetForm = () => {
    setEditId(null);
    setFullName("");
    setEmail("");
    setPhoneNumber("");
    setInstagram("");
    setError(null);
  };

  // Form Edit Click
  const handleEditClick = (cust: any) => {
    setEditId(cust.id);
    setFullName(cust.fullName);
    setEmail(cust.email);
    setPhoneNumber(cust.phoneNumber || "");
    setInstagram(cust.instagram || "");
    setError(null);
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !email) {
      setError("Nama Lengkap dan Email wajib diisi.");
      return;
    }

    startTransition(async () => {
      if (editId) {
        // Update Action
        const res = await updateCustomerAction(editId, {
          fullName,
          email,
          phoneNumber: phoneNumber || null,
          instagram: instagram || null,
        });

        if (res.success && res.data) {
          setCustomerList((prev) =>
            prev.map((c) => (c.id === editId ? { ...c, ...res.data } : c))
          );
          toast.success("Data pelanggan berhasil diperbarui!");
          resetForm();
        } else {
          setError(res.error || "Gagal memperbarui data pelanggan.");
        }
      } else {
        // Create Action
        const res = await createCustomerAction({
          fullName,
          email,
          phoneNumber: phoneNumber || null,
          instagram: instagram || null,
        });

        if (res.success && res.data) {
          // Add default empty bookings array for client side filtering consistency
          const newCust = { ...res.data, bookings: [] };
          setCustomerList((prev) => [newCust, ...prev]);
          toast.success("Pelanggan baru berhasil ditambahkan!");
          resetForm();
        } else {
          setError(res.error || "Gagal menambahkan pelanggan baru.");
        }
      }
    });
  };

  // Delete Click
  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  // Confirm Delete
  const confirmDelete = async () => {
    if (!deleteConfirmId) return;

    startTransition(async () => {
      const res = await deleteCustomerAction(deleteConfirmId);
      if (res.success) {
        setCustomerList((prev) => prev.filter((c) => c.id !== deleteConfirmId));
        toast.success("Data pelanggan berhasil dihapus secara permanen!");
        setDeleteConfirmId(null);
      } else {
        await alert(res.error || "Gagal menghapus data pelanggan.");
        setDeleteConfirmId(null);
      }
    });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearch("");
    setCategoryFilter("ALL");
    setPresenceFilter("ALL");
    setCurrentPage(1);
  };

  // Filter logic
  const filteredCustomers = customerList.filter((cust) => {
    // 1. Text Search
    const matchesSearch =
      cust.fullName.toLowerCase().includes(search.toLowerCase()) ||
      cust.email.toLowerCase().includes(search.toLowerCase()) ||
      (cust.phoneNumber && cust.phoneNumber.includes(search)) ||
      (cust.instagram &&
        cust.instagram.toLowerCase().replace(/^@+/, "").includes(search.toLowerCase().replace(/^@+/, "")));

    // 2. Category Filter
    let matchesCategory = true;
    if (categoryFilter !== "ALL") {
      const catPackages = packages.filter((p) => p.categoryId === categoryFilter);
      const catPkgIdentifiers = [
        ...catPackages.map((p) => p.id),
        ...catPackages.map((p) => p.name.toLowerCase()),
      ];

      matchesCategory = (cust.bookings || []).some((b: any) =>
        catPkgIdentifiers.includes(b.packageType) ||
        catPkgIdentifiers.includes(b.packageType.toLowerCase())
      );
    }

    // 3. Booking Presence Filter
    let matchesPresence = true;
    if (presenceFilter === "HAS_BOOKINGS") {
      matchesPresence = (cust.bookings || []).length > 0;
    } else if (presenceFilter === "NO_BOOKINGS") {
      matchesPresence = (cust.bookings || []).length === 0;
    }

    return matchesSearch && matchesCategory && matchesPresence;
  });

  // Sort logic
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === "bookingsCount") {
      valA = (a.bookings || []).length;
      valB = (b.bookings || []).length;
    }

    if (valA === undefined || valA === null) return sortOrder === "asc" ? -1 : 1;
    if (valB === undefined || valB === null) return sortOrder === "asc" ? 1 : -1;

    if (sortField === "createdAt") {
      const dateA = new Date(valA).getTime();
      const dateB = new Date(valB).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    }

    if (typeof valA === "string") {
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    } else {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedCustomers.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <SidebarProvider>
      <AdminSidebar variant="sidebar" />
      <SidebarInset className="flex flex-col min-h-screen bg-background text-foreground">
        <AdminHeader title="Manajemen Studio Seniman Kamera" />

        {/* Content Container */}
        <div className="flex-1 px-6 md:px-12 py-10 max-w-[1200px] mx-auto w-full space-y-12">
          {/* Header Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/20 pb-6">
            <div className="space-y-2">
              <h2 className="font-serif text-3xl md:text-5xl text-primary font-medium">
                Manajemen Pelanggan
              </h2>
              <p className="font-sans text-sm text-secondary font-light">
                Kelola basis data pelanggan, periksa riwayat kontak, dan pantau pemesanan mereka.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Side (Left Panel) */}
            <form
              onSubmit={handleSubmit}
              className="lg:col-span-4 border border-border/40 bg-card p-6 space-y-5 rounded-none font-sans text-xs"
            >
              <h3 className="font-serif text-lg text-primary mb-4 font-semibold flex items-center justify-between pb-3 border-b border-border/20">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {editId ? "Ubah Data Pelanggan" : "Tambah Pelanggan Baru"}
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

              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label htmlFor="customer-fullname-input" className="uppercase tracking-wider text-secondary font-bold block">
                  Nama Lengkap
                </label>
                <input
                  id="customer-fullname-input"
                  type="text"
                  placeholder="Nama Lengkap Pelanggan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="customer-email-input" className="uppercase tracking-wider text-secondary font-bold block">
                  Email
                </label>
                <input
                  id="customer-email-input"
                  type="email"
                  placeholder="email@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary"
                  required
                />
              </div>

              {/* Nomor Handphone */}
              <div className="space-y-1.5">
                <label htmlFor="customer-phone-input" className="uppercase tracking-wider text-secondary font-bold block">
                  No. WhatsApp (WA)
                </label>
                <input
                  id="customer-phone-input"
                  type="text"
                  placeholder="contoh: 081234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary"
                />
              </div>

              {/* Instagram */}
              <div className="space-y-1.5">
                <label htmlFor="customer-instagram-input" className="uppercase tracking-wider text-secondary font-bold block">
                  Username Instagram (Opsional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary font-bold font-mono">
                    @
                  </span>
                  <input
                    id="customer-instagram-input"
                    type="text"
                    placeholder="username"
                    value={instagram.replace(/^@+/, "")}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-transparent border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  id="customer-submit-button"
                  type="submit"
                  disabled={isPending}
                  className="w-full uppercase tracking-widest py-5 rounded-none font-bold text-white cursor-pointer"
                >
                  {isPending ? "Memproses..." : editId ? "Perbarui Pelanggan" : "Tambah Pelanggan"}
                </Button>
              </div>
            </form>

            {/* List Side (Right Panel) */}
            <div className="lg:col-span-8 border border-border/40 bg-card p-6 space-y-4 rounded-none font-sans text-xs">
              {/* Header section with counts */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/20">
                <h3 className="font-serif text-lg text-primary uppercase tracking-wider text-xs font-semibold">
                  Daftar Pelanggan Terdaftar
                </h3>
                <span className="font-sans text-secondary text-[11px] font-light">
                  Menampilkan {filteredCustomers.length} dari {customerList.length} pelanggan
                </span>
              </div>

              {/* Advanced Filter Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary" />
                  <input
                    id="customer-search-input"
                    type="text"
                    placeholder="Cari nama, email, WA..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 bg-background border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary text-[11px]"
                  />
                </div>

                {/* Filter Category */}
                <select
                  id="customer-category-filter"
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1.5 bg-background border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary text-[11px] cursor-pointer"
                >
                  <option value="ALL">Semua Kategori Booking</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                  <option value="KATEGORI_TIDAK_ADA">Kategori Kosong (Simulasi)</option>
                </select>

                {/* Filter Presence */}
                <div className="flex gap-2">
                  <select
                    id="customer-status-filter"
                    value={presenceFilter}
                    onChange={(e) => {
                      setPresenceFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="flex-1 px-2 py-1.5 bg-background border border-border/40 focus:border-primary focus:outline-none rounded-none text-primary text-[11px] cursor-pointer"
                  >
                    <option value="ALL">Semua Status Booking</option>
                    <option value="HAS_BOOKINGS">Memiliki Booking</option>
                    <option value="NO_BOOKINGS">Belum Ada Booking</option>
                  </select>

                  <Button
                    id="customer-reset-filters-button"
                    type="button"
                    variant="outline"
                    onClick={handleResetFilters}
                    className="text-[10px] uppercase font-bold tracking-wider px-3 h-auto py-1.5 rounded-none cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 border-border/40 text-secondary"
                  >
                    Reset
                  </Button>
                </div>
              </div>

              {/* Customer Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead>
                    <tr className="border-b border-border/40 uppercase tracking-wider text-secondary font-bold">
                      <th
                        id="customer-sort-name"
                        className="py-3 px-2 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleSort("fullName")}
                      >
                        <span className="flex items-center gap-1">
                          Nama <ArrowUpDown className="w-3 h-3 text-secondary/60" />
                        </span>
                      </th>
                      <th
                        id="customer-sort-contact"
                        className="py-3 px-2 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleSort("email")}
                      >
                        <span className="flex items-center gap-1">
                          Kontak <ArrowUpDown className="w-3 h-3 text-secondary/60" />
                        </span>
                      </th>
                      <th className="py-3 px-2">Instagram</th>
                      <th
                        id="customer-sort-booking"
                        className="py-3 px-2 text-center cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleSort("bookingsCount")}
                      >
                        <span className="flex items-center justify-center gap-1">
                          Booking <ArrowUpDown className="w-3 h-3 text-secondary/60" />
                        </span>
                      </th>
                      <th className="py-3 px-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20 text-primary">
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-secondary font-light">
                          Tidak ada data pelanggan yang cocok dengan filter.
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((cust) => (
                        <tr key={cust.id} className="hover:bg-muted/10 transition-colors">
                          <td className="py-4 px-2 font-bold">{cust.fullName}</td>
                          <td className="py-4 px-2">
                            <div>{cust.email}</div>
                            <div className="text-[10px] text-secondary mt-0.5 font-mono">
                              {cust.phoneNumber || <span className="italic opacity-40">-</span>}
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            {cust.instagram ? (
                              <span className="inline-flex items-center gap-1 bg-secondary/15 text-primary px-2 py-0.5 rounded-none font-mono text-[10px] font-bold">
                                @{cust.instagram.replace(/^@+/, "")}
                              </span>
                            ) : (
                              <span className="italic text-secondary/40">Tidak ada</span>
                            )}
                          </td>
                          <td className="py-4 px-2 text-center font-bold font-mono">
                            {(cust.bookings || []).length}
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div className="flex justify-end gap-1.5">
                              {/* Edit Button */}
                              <Button
                                id={`customer-edit-${cust.id}`}
                                type="button"
                                variant="ghost"
                                size="icon"
                                title="Ubah Data"
                                onClick={() => handleEditClick(cust)}
                                className="h-8 w-8 text-secondary hover:text-primary cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>

                              {/* Delete Button */}
                              <Button
                                id={`customer-delete-${cust.id}`}
                                type="button"
                                variant="ghost"
                                size="icon"
                                title="Hapus Permanen"
                                onClick={() => handleDeleteClick(cust.id)}
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/10 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border/20 pt-4 font-sans text-[11px] text-secondary">
                  <div>
                    Menampilkan <span className="font-bold">{indexOfFirstItem + 1}</span> hingga{" "}
                    <span className="font-bold">
                      {Math.min(indexOfLastItem, filteredCustomers.length)}
                    </span>{" "}
                    dari <span className="font-bold">{filteredCustomers.length}</span> pelanggan
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-2 py-1 h-auto text-[10px] uppercase font-bold rounded-none cursor-pointer disabled:opacity-40"
                    >
                      Sebelumnya
                    </Button>
                    <span className="px-3">
                      Halaman <span className="font-bold">{currentPage}</span> dari{" "}
                      <span className="font-bold">{totalPages}</span>
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-2 py-1 h-auto text-[10px] uppercase font-bold rounded-none cursor-pointer disabled:opacity-40"
                    >
                      Berikutnya
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setDeleteConfirmId(null)}
          />

          {/* Modal Content */}
          <div className="bg-card border border-border/40 text-foreground max-w-sm w-full p-8 relative z-10 rounded-none shadow-2xl flex flex-col space-y-6 animate-[scaleIn_0.2s_ease-out] font-sans text-xs">
            <div className="space-y-2">
              <span className="font-sans text-[9px] uppercase tracking-widest text-red-600 font-bold block">
                Konfirmasi Hapus Pelanggan
              </span>
              <h3 className="font-serif text-lg font-medium text-primary leading-tight">
                Hapus Pelanggan Ini?
              </h3>
              <p className="text-secondary font-light leading-relaxed">
                Tindakan ini akan menghapus data pelanggan secara permanen dari database. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                id="customer-delete-modal-cancel"
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2.5 bg-transparent border border-border hover:bg-neutral-100 dark:hover:bg-neutral-900 text-primary font-sans text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-none"
              >
                Batal
              </button>
              <button
                id="customer-delete-modal-confirm"
                type="button"
                onClick={confirmDelete}
                disabled={isPending}
                className="px-5 py-2.5 bg-red-600 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-sans text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer rounded-none"
              >
                {isPending ? "Menghapus..." : "Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
