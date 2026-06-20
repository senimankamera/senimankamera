"use server";

import { createClient } from "@/src/infrastructure/supabase/server";
import { MediaUploadService } from "../services/media-upload.service";
import { GalleryRepository } from "../repositories/gallery.repository";
import { revalidatePath } from "next/cache";

import { getFileFromFormData } from "@/lib/image-upload-server";

export async function uploadMediaAction(formData: FormData) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const file = getFileFromFormData(formData, "file");
    if (!file) {
      throw new Error("File tidak ditemukan.");
    }

    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const subCategory = formData.get("subCategory") as string;
    const aspect = formData.get("aspect") as string;
    const description = (formData.get("description") as string) || undefined;

    if (!title || !category || !subCategory || !aspect) {
      throw new Error("Mohon lengkapi semua field yang wajib diisi.");
    }

    // Upload and optimize
    const uploadService = new MediaUploadService();
    const uploadResult = await uploadService.uploadMedia(file);

    // Save record to DB
    const repo = new GalleryRepository();
    const newItem = await repo.createGallery({
      title,
      category,
      subCategory,
      imageUrl: uploadResult.publicUrl,
      aspect,
      description,
      mediaType: uploadResult.mediaType,
      storagePath: uploadResult.storagePath,
      fileSize: uploadResult.fileSize,
      width: uploadResult.width,
      height: uploadResult.height,
    });

    revalidatePath("/portfolio");
    revalidatePath("/admin/galleries");

    return { success: true, data: JSON.parse(JSON.stringify(newItem)) };
  } catch (error: any) {
    console.error("uploadMediaAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Gagal mengunggah media." };
  }
}
