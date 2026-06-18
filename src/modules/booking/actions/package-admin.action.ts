"use server";

import { PackageRepository } from "../repositories/package.repository";
import { revalidatePath } from "next/cache";

export async function createPackageAction(data: {
  name: string;
  categoryId: string;
  price: number;
  features: string[];
  description?: string;
  sessionDuration?: number | null;
}) {
  try {
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
    name?: string;
    categoryId?: string;
    price?: number;
    features?: string[];
    description?: string;
    sessionDuration?: number | null;
  }
) {
  try {
    const repo = new PackageRepository();
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
    const repo = new PackageRepository();
    await repo.deletePackage(id);

    revalidatePath("/services");
    revalidatePath("/admin/packages");

    return { success: true };
  } catch (error: any) {
    console.error("deletePackageAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal menghapus paket." };
  }
}
