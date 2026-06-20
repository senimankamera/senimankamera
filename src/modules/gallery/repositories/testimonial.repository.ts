import { prisma } from "@/src/infrastructure/prisma/client";

export class TestimonialRepository {
  async findAll() {
    return prisma.testimonial.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async createTestimonial(data: {
    name: string;
    role?: string | null;
    content: string;
    avatarUrl?: string | null;
    storagePath?: string | null;
  }) {
    return prisma.testimonial.create({
      data,
    });
  }

  async updateTestimonial(
    id: string,
    data: {
      name: string;
      role?: string | null;
      content: string;
      avatarUrl?: string | null;
      storagePath?: string | null;
    }
  ) {
    return prisma.testimonial.update({
      where: { id },
      data,
    });
  }

  async deleteTestimonial(id: string) {
    const item = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (item && item.storagePath) {
      try {
        const { MediaUploadService } = await import("../services/media-upload.service");
        const service = new MediaUploadService();
        await service.deleteMedia(item.storagePath);
      } catch (error) {
        console.error("Error deleting avatar from Supabase Storage:", error);
      }
    }

    return prisma.testimonial.delete({
      where: { id },
    });
  }

  async findById(id: string) {
    return prisma.testimonial.findUnique({
      where: { id },
    });
  }
}
