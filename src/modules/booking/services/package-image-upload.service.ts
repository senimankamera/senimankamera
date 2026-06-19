import { createClient } from "@/src/infrastructure/supabase/server";
import crypto from "crypto";

export class PackageImageUploadService {
  async uploadPackageImage(file: File): Promise<{
    publicUrl: string;
    storagePath: string;
  }> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      throw new Error("Tipe file tidak didukung. Harap unggah file gambar/foto.");
    }

    const maxImageSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxImageSize) {
      throw new Error("Ukuran gambar melebihi batas maksimal 10 MB.");
    }

    const supabase = await createClient();
    const uuid = crypto.randomUUID();

    let optimizedBuffer: Buffer;
    
    try {
      const sharp = (await import("sharp")).default;
      // Crop & resize to exactly 4:5 aspect ratio (800 width, 1000 height)
      optimizedBuffer = await sharp(buffer)
        .resize({
          width: 800,
          height: 1000,
          fit: "cover",
          position: "center",
        })
        .webp({ quality: 85 })
        .toBuffer();
    } catch (sharpError) {
      console.error("Error optimizing package image with sharp:", sharpError);
      throw new Error("Gagal memproses gambar. Pastikan format file gambar valid.");
    }

    const fileName = `${uuid}.webp`;
    const storagePath = `images/packages/${fileName}`;

    const { error } = await supabase.storage
      .from("portfolio")
      .upload(storagePath, optimizedBuffer, {
        contentType: "image/webp",
        cacheControl: "31536000", // 1 year cache
        upsert: false,
      });

    if (error) {
      console.error("Supabase storage package upload error:", error);
      throw new Error(`Gagal mengunggah file ke storage: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from("portfolio")
      .getPublicUrl(storagePath);

    return {
      publicUrl,
      storagePath,
    };
  }

  async deletePackageImage(storagePath: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.storage
      .from("portfolio")
      .remove([storagePath]);

    if (error) {
      console.error("Supabase storage package delete error:", error);
      throw new Error(`Gagal menghapus file dari storage: ${error.message}`);
    }
  }
}
