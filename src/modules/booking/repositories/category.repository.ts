import { prisma } from "@/src/infrastructure/prisma/client";

export class CategoryRepository {
  async findAll() {
    return prisma.category.findMany({
      orderBy: {
        order: "asc",
      },
      include: {
        _count: {
          select: {
            packages: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            packages: true,
          },
        },
      },
    });
  }

  async findByName(name: string) {
    return prisma.category.findUnique({
      where: { name },
    });
  }

  async create(data: {
    name: string;
    label: string;
    description?: string;
    order?: number;
    bookingType?: string;
  }) {
    return prisma.category.create({
      data,
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      label?: string;
      description?: string | null;
      order?: number;
      bookingType?: string;
    }
  ) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }
}
