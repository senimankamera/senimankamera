"use server";

import { PackageRepository } from "../repositories/package.repository";
import { createClient } from "@/src/infrastructure/supabase/server";
import { prisma } from "@/src/infrastructure/prisma/client";
import { revalidatePath } from "next/cache";

export async function createPackageAction(data: {
  name: string;
  categoryId: string;
  code?: string;
  price: number;
  features: string[];
  description?: string;
  sessionDuration?: number | null;
  textColor?: string;
  buttonColor?: string;
  imageUrl?: string | null;
  imageStoragePath?: string | null;
}) {
  try {
    // Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    if (!data.name || !data.categoryId || isNaN(data.price) || !data.features || data.features.length === 0) {
      throw new Error("Semua field wajib diisi (Nama, Kategori, Harga, Fitur).");
    }

    const repo = new PackageRepository();
    const pkg = await repo.createPackage(data);

    revalidatePath("/services");
    revalidatePath("/admin/packages");

    return { success: true, data: JSON.parse(JSON.stringify(pkg)) };
  } catch (error: any) {
    console.error("createPackageAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal membuat paket." };
  }
}

export async function updatePackageAction(
  id: string,
  data: {
    name: string;
    categoryId: string;
    code?: string;
    price: number;
    features: string[];
    description?: string;
    sessionDuration?: number | null;
    textColor?: string;
    buttonColor?: string;
    imageUrl?: string | null;
    imageStoragePath?: string | null;
  }
) {
  try {
    // Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    if (!id || !data.name || !data.categoryId || isNaN(data.price) || !data.features || data.features.length === 0) {
      throw new Error("Semua field wajib diisi (ID, Nama, Kategori, Harga, Fitur).");
    }

    const repo = new PackageRepository();
    const existingPackage = await prisma.package.findUnique({
      where: { id }
    });

    if (!existingPackage) {
      throw new Error("Paket tidak ditemukan.");
    }

    const pkg = await repo.updatePackage(id, data);

    revalidatePath("/services");
    revalidatePath("/admin/packages");

    return { success: true, data: JSON.parse(JSON.stringify(pkg)) };
  } catch (error: any) {
    console.error("updatePackageAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal memperbarui paket." };
  }
}

export async function deletePackageAction(id: string) {
  try {
    // Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const repo = new PackageRepository();

    // Fetch existing package to check for imageStoragePath
    const existingPackage = await prisma.package.findUnique({
      where: { id }
    });

    if (existingPackage?.imageStoragePath) {
      const { error: deleteError } = await supabase.storage
        .from("portfolio")
        .remove([existingPackage.imageStoragePath]);
        
      if (deleteError) {
        console.error("Failed to delete package image on delete:", deleteError);
      }
    }

    await repo.deletePackage(id);

    revalidatePath("/services");
    revalidatePath("/admin/packages");

    return { success: true };
  } catch (error: any) {
    console.error("deletePackageAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal menghapus paket." };
  }
}
