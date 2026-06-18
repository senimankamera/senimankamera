"use server";

import { CategoryRepository } from "../repositories/category.repository";
import { revalidatePath } from "next/cache";

export async function createCategoryAction(data: {
  name: string;
  label: string;
  description?: string;
  order?: number;
  bookingType?: string;
}) {
  try {
    const repo = new CategoryRepository();
    
    // Check if name already exists
    const existing = await repo.findByName(data.name);
    if (existing) {
      return { success: false, error: `Kategori dengan nama "${data.name}" sudah ada.` };
    }

    const category = await repo.create(data);

    revalidatePath("/admin/categories");
    revalidatePath("/admin/packages");
    revalidatePath("/admin/galleries");
    revalidatePath("/book");
    revalidatePath("/services");

    return { success: true, data: JSON.parse(JSON.stringify(category)) };
  } catch (error: any) {
    console.error("createCategoryAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal membuat kategori." };
  }
}

export async function updateCategoryAction(
  id: string,
  data: {
    name?: string;
    label?: string;
    description?: string | null;
    order?: number;
    bookingType?: string;
  }
) {
  try {
    const repo = new CategoryRepository();

    if (data.name) {
      const existing = await repo.findByName(data.name);
      if (existing && existing.id !== id) {
        return { success: false, error: `Kategori dengan nama "${data.name}" sudah digunakan oleh kategori lain.` };
      }
    }

    const category = await repo.update(id, data);

    revalidatePath("/admin/categories");
    revalidatePath("/admin/packages");
    revalidatePath("/admin/galleries");
    revalidatePath("/book");
    revalidatePath("/services");

    return { success: true, data: JSON.parse(JSON.stringify(category)) };
  } catch (error: any) {
    console.error("updateCategoryAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal memperbarui kategori." };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    const repo = new CategoryRepository();
    const category = await repo.findById(id);

    if (!category) {
      return { success: false, error: "Kategori tidak ditemukan." };
    }

    // Explicit check for packages count
    if (category._count.packages > 0) {
      return {
        success: false,
        error: `Kategori "${category.label}" tidak dapat dihapus karena masih terhubung dengan ${category._count.packages} paket harga. Silakan hapus atau ubah kategori paket tersebut terlebih dahulu.`,
      };
    }

    await repo.delete(id);

    revalidatePath("/admin/categories");
    revalidatePath("/admin/packages");
    revalidatePath("/admin/galleries");
    revalidatePath("/book");
    revalidatePath("/services");

    return { success: true };
  } catch (error: any) {
    console.error("deleteCategoryAction error:", error);
    // Handle database foreign key constraint rejection gracefully
    if (error.code === "P2003") {
      return {
        success: false,
        error: "Kategori tidak dapat dihapus karena masih digunakan oleh data lain di database.",
      };
    }
    return { success: false, error: error instanceof Error ? error.message : "Gagal menghapus kategori." };
  }
}
