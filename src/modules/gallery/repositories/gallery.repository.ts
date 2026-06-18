import { prisma } from "@/src/infrastructure/prisma/client";

export class GalleryRepository {
  async findAll() {
    return prisma.gallery.findMany({
      orderBy: {
        id: "asc",
      },
    });
  }

  async createGallery(data: {
    title: string;
    category: string;
    subCategory: string;
    imageUrl: string;
    aspect: string;
    description?: string;
    mediaType?: string;
    storagePath?: string;
    fileSize?: number;
    width?: number;
    height?: number;
  }) {
    return prisma.gallery.create({
      data,
    });
  }

  async deleteGallery(id: number) {
    const item = await prisma.gallery.findUnique({
      where: { id },
    });

    if (item && item.storagePath) {
      try {
        const { MediaUploadService } = await import("../services/media-upload.service");
        const service = new MediaUploadService();
        await service.deleteMedia(item.storagePath);
      } catch (error) {
        console.error("Error deleting file from Supabase Storage:", error);
      }
    }

    return prisma.gallery.delete({
      where: { id },
    });
  }

  async findById(id: number) {
    return prisma.gallery.findUnique({
      where: { id },
    });
  }

  async updateGallery(id: number, data: {
    title: string;
    category: string;
    subCategory: string;
    aspect: string;
    description?: string;
    imageUrl?: string;
    mediaType?: string;
    storagePath?: string;
    fileSize?: number;
    width?: number;
    height?: number;
  }) {
    return prisma.gallery.update({
      where: { id },
      data,
    });
  }
}

