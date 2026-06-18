"use server";

import { GalleryRepository } from "../repositories/gallery.repository";
import { revalidatePath } from "next/cache";
import { createClient } from "@/src/infrastructure/supabase/server";
import { MediaUploadService } from "../services/media-upload.service";

export async function createGalleryAction(data: {
  title: string;
  category: string;
  subCategory: string;
  imageUrl: string;
  aspect: string;
  description?: string;
}) {
  try {
    const repo = new GalleryRepository();
    const item = await repo.createGallery(data);

    revalidatePath("/portfolio");
    revalidatePath("/admin/galleries");

    return { success: true, data: item };
  } catch (error: any) {
    console.error("createGalleryAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal membuat galeri." };
  }
}

export async function deleteGalleryAction(id: number) {
  try {
    const repo = new GalleryRepository();
    await repo.deleteGallery(id);

    revalidatePath("/portfolio");
    revalidatePath("/admin/galleries");

    return { success: true };
  } catch (error: any) {
    console.error("deleteGalleryAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal menghapus galeri." };
  }
}

export async function updateGalleryAction(formData: FormData) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const idStr = formData.get("id") as string;
    if (!idStr) {
      throw new Error("ID tidak ditemukan.");
    }
    const id = parseInt(idStr, 10);

    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const subCategory = formData.get("subCategory") as string;
    const aspect = formData.get("aspect") as string;
    const description = (formData.get("description") as string) || undefined;

    if (!title || !category || !subCategory || !aspect) {
      throw new Error("Mohon lengkapi semua field yang wajib diisi.");
    }

    const repo = new GalleryRepository();
    const existingItem = await repo.findById(id);
    if (!existingItem) {
      throw new Error("Item portofolio tidak ditemukan.");
    }

    let mediaData: any = {};
    const file = formData.get("file") as File | null;
    
    // Check if file is uploaded and valid
    if (file && file.size > 0 && file.name !== "undefined") {
      const uploadService = new MediaUploadService();
      const uploadResult = await uploadService.uploadMedia(file);

      mediaData = {
        imageUrl: uploadResult.publicUrl,
        mediaType: uploadResult.mediaType,
        storagePath: uploadResult.storagePath,
        fileSize: uploadResult.fileSize,
        width: uploadResult.width,
        height: uploadResult.height,
      };

      // Delete the old file from storage if it exists
      if (existingItem.storagePath) {
        try {
          await uploadService.deleteMedia(existingItem.storagePath);
        } catch (storageErr) {
          console.error("Error deleting old file during update:", storageErr);
        }
      }
    }

    const updatedItem = await repo.updateGallery(id, {
      title,
      category,
      subCategory,
      aspect,
      description,
      ...mediaData,
    });

    revalidatePath("/portfolio");
    revalidatePath("/admin/galleries");

    return { success: true, data: JSON.parse(JSON.stringify(updatedItem)) };
  } catch (error: any) {
    console.error("updateGalleryAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal memperbarui media." };
  }
}

