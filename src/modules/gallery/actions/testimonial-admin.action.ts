"use server";

import { createClient } from "@/src/infrastructure/supabase/server";
import { MediaUploadService } from "../services/media-upload.service";
import { TestimonialRepository } from "../repositories/testimonial.repository";
import { revalidatePath } from "next/cache";

export async function createTestimonialAction(formData: FormData) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    const content = formData.get("content") as string;
    const file = formData.get("file") as File | null;

    if (!name || !content) {
      throw new Error("Mohon lengkapi semua field yang wajib diisi (Nama dan Testimoni).");
    }

    let avatarUrl: string | null = null;
    let storagePath: string | null = null;

    // Check if file is uploaded and valid
    if (file && file.size > 0 && file.name !== "undefined") {
      const uploadService = new MediaUploadService();
      const uploadResult = await uploadService.uploadMedia(file);
      avatarUrl = uploadResult.publicUrl;
      storagePath = uploadResult.storagePath;
    }

    const repo = new TestimonialRepository();
    const newItem = await repo.createTestimonial({
      name,
      role: role || null,
      content,
      avatarUrl,
      storagePath,
    });

    revalidatePath("/");
    revalidatePath("/admin/testimonials");

    return { success: true, data: JSON.parse(JSON.stringify(newItem)) };
  } catch (error: any) {
    console.error("createTestimonialAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menyimpan testimoni.",
    };
  }
}

export async function updateTestimonialAction(formData: FormData) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const id = formData.get("id") as string;
    if (!id) {
      throw new Error("ID tidak ditemukan.");
    }

    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    const content = formData.get("content") as string;
    const file = formData.get("file") as File | null;

    if (!name || !content) {
      throw new Error("Mohon lengkapi semua field yang wajib diisi (Nama dan Testimoni).");
    }

    const repo = new TestimonialRepository();
    const existingItem = await repo.findById(id);
    if (!existingItem) {
      throw new Error("Testimoni tidak ditemukan.");
    }

    let mediaData: any = {};

    // Check if file is uploaded and valid
    if (file && file.size > 0 && file.name !== "undefined") {
      const uploadService = new MediaUploadService();
      const uploadResult = await uploadService.uploadMedia(file);
      mediaData = {
        avatarUrl: uploadResult.publicUrl,
        storagePath: uploadResult.storagePath,
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

    const updatedItem = await repo.updateTestimonial(id, {
      name,
      role: role || null,
      content,
      ...mediaData,
    });

    revalidatePath("/");
    revalidatePath("/admin/testimonials");

    return { success: true, data: JSON.parse(JSON.stringify(updatedItem)) };
  } catch (error: any) {
    console.error("updateTestimonialAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui testimoni.",
    };
  }
}

export async function deleteTestimonialAction(id: string) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const repo = new TestimonialRepository();
    await repo.deleteTestimonial(id);

    revalidatePath("/");
    revalidatePath("/admin/testimonials");

    return { success: true };
  } catch (error: any) {
    console.error("deleteTestimonialAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus testimoni.",
    };
  }
}
