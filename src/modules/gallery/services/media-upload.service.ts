import { createClient } from "@/src/infrastructure/supabase/server";
import crypto from "crypto";

export class MediaUploadService {
  async uploadMedia(file: File): Promise<{
    publicUrl: string;
    storagePath: string;
    mediaType: "image";
    fileSize: number;
    width?: number;
    height?: number;
  }> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileSize = file.size;

    const isImage = file.type.startsWith("image/");

    if (!isImage) {
      throw new Error("Tipe file tidak didukung. Harap unggah file gambar/foto.");
    }

    // Validation limits
    const maxImageSize = 20 * 1024 * 1024; // 20MB

    if (fileSize > maxImageSize) {
      throw new Error("Ukuran gambar melebihi batas maksimal 20 MB.");
    }

    const supabase = await createClient();
    const uuid = crypto.randomUUID();

    let optimizedBuffer: any = buffer;
    let width: number | undefined;
    let height: number | undefined;
    let fileExtension = "webp";
    let mediaType: "image" = "image";
    let contentType = "image/webp";

    try {
      const sharp = (await import("sharp")).default;
      const image = sharp(buffer);
      const metadata = await image.metadata();

      let pipeline = image;
      if (metadata.width && metadata.width > 1920) {
        pipeline = pipeline.resize({
          width: 1920,
          fit: "inside",
          withoutEnlargement: true,
        });
      }

      // Convert to webp with quality 85 (keeps details high)
      optimizedBuffer = await pipeline.webp({ quality: 85 }).toBuffer();

      const optimizedMetadata = await sharp(optimizedBuffer).metadata();
      width = optimizedMetadata.width;
      height = optimizedMetadata.height;
    } catch (sharpError) {
      console.error("Error optimizing image with sharp:", sharpError);
      // Fallback to original image if sharp fails
      contentType = file.type;
      fileExtension = file.name.split(".").pop() || "jpg";
    }

    const fileName = `${uuid}.${fileExtension}`;
    const storagePath = `images/${fileName}`;

    const { data, error } = await supabase.storage
      .from("portfolio")
      .upload(storagePath, optimizedBuffer, {
        contentType,
        cacheControl: "31536000", // 1 year cache
        upsert: false,
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      throw new Error(`Gagal mengunggah file ke storage: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from("portfolio")
      .getPublicUrl(storagePath);

    return {
      publicUrl,
      storagePath,
      mediaType,
      fileSize: optimizedBuffer.length,
      width,
      height,
    };
  }

  async deleteMedia(storagePath: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.storage
      .from("portfolio")
      .remove([storagePath]);

    if (error) {
      console.error("Supabase storage delete error:", error);
      throw new Error(`Gagal menghapus file dari storage: ${error.message}`);
    }
  }
}
