"use server";

import { PackageRepository } from "../repositories/package.repository";
import { PackageImageUploadService } from "../services/package-image-upload.service";
import { createClient } from "@/src/infrastructure/supabase/server";
import { prisma } from "@/src/infrastructure/prisma/client";
import { revalidatePath } from "next/cache";
import { getFileFromFormData } from "@/lib/image-upload-server";

export async function createPackageAction(formData: FormData) {
  try {
    // Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const repo = new PackageRepository();
    const uploader = new PackageImageUploadService();

    const name = formData.get("name") as string;
    const categoryId = formData.get("categoryId") as string;
    const priceStr = formData.get("price") as string;
    const featuresRaw = formData.get("features") as string;
    const description = (formData.get("description") as string) || undefined;
    const sessionDurationStr = formData.get("sessionDuration") as string;
    const textColor = (formData.get("textColor") as string) || "DEFAULT";
    const buttonColor = (formData.get("buttonColor") as string) || "DEFAULT";
    const file = getFileFromFormData(formData, "file");

    if (!name || !categoryId || !priceStr || !featuresRaw) {
      throw new Error("Semua field wajib diisi (Nama, Kategori, Harga, Fitur).");
    }

    const price = parseFloat(priceStr);
    const sessionDuration = sessionDurationStr ? parseInt(sessionDurationStr, 10) : null;

    // Split features by comma or newline
    const features = featuresRaw
      .split(/[\n,]+/)
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    let imageUrl: string | undefined = undefined;
    let imageStoragePath: string | undefined = undefined;

    if (file && file.size > 0) {
      const uploadResult = await uploader.uploadPackageImage(file);
      imageUrl = uploadResult.publicUrl;
      imageStoragePath = uploadResult.storagePath;
    }

    const pkg = await repo.createPackage({
      name,
      categoryId,
      price,
      features,
      description,
      sessionDuration,
      textColor,
      buttonColor,
      imageUrl,
      imageStoragePath,
    });

    revalidatePath("/services");
    revalidatePath("/admin/packages");

    return { success: true, data: JSON.parse(JSON.stringify(pkg)) };
  } catch (error: any) {
    console.error("createPackageAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal membuat paket." };
  }
}

export async function updatePackageAction(formData: FormData) {
  try {
    // Auth Check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const repo = new PackageRepository();
    const uploader = new PackageImageUploadService();

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const categoryId = formData.get("categoryId") as string;
    const priceStr = formData.get("price") as string;
    const featuresRaw = formData.get("features") as string;
    const description = (formData.get("description") as string) || undefined;
    const sessionDurationStr = formData.get("sessionDuration") as string;
    const textColor = formData.get("textColor") as string || "DEFAULT";
    const buttonColor = formData.get("buttonColor") as string || "DEFAULT";
    const file = getFileFromFormData(formData, "file");
    const removeBg = formData.get("removeBg") === "true";

    if (!id || !name || !categoryId || !priceStr || !featuresRaw) {
      throw new Error("Semua field wajib diisi (ID, Nama, Kategori, Harga, Fitur).");
    }

    const price = parseFloat(priceStr);
    const sessionDuration = sessionDurationStr ? parseInt(sessionDurationStr, 10) : null;

    // Split features
    const features = featuresRaw
      .split(/[\n,]+/)
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    // Fetch existing package to check for old image
    const existingPackage = await prisma.package.findUnique({
      where: { id }
    });

    let imageUrl: string | null | undefined = undefined;
    let imageStoragePath: string | null | undefined = undefined;

    if (removeBg) {
      // User requested to remove the background
      if (existingPackage?.imageStoragePath) {
        await uploader.deletePackageImage(existingPackage.imageStoragePath).catch(err => {
          console.error("Failed to delete package image on update removal:", err);
        });
      }
      imageUrl = null;
      imageStoragePath = null;
    } else if (file && file.size > 0) {
      // User uploaded a new file
      // Delete old file if present
      if (existingPackage?.imageStoragePath) {
        await uploader.deletePackageImage(existingPackage.imageStoragePath).catch(err => {
          console.error("Failed to delete old package image:", err);
        });
      }
      const uploadResult = await uploader.uploadPackageImage(file);
      imageUrl = uploadResult.publicUrl;
      imageStoragePath = uploadResult.storagePath;
    }

    const pkg = await repo.updatePackage(id, {
      name,
      categoryId,
      price,
      features,
      description,
      sessionDuration,
      textColor,
      buttonColor,
      imageUrl,
      imageStoragePath,
    });

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
    const uploader = new PackageImageUploadService();

    // Fetch existing package to check for imageStoragePath
    const existingPackage = await prisma.package.findUnique({
      where: { id }
    });

    if (existingPackage?.imageStoragePath) {
      await uploader.deletePackageImage(existingPackage.imageStoragePath).catch(err => {
        console.error("Failed to delete package image on delete:", err);
      });
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
