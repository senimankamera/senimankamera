import { prisma } from "@/src/infrastructure/prisma/client";

export class PackageRepository {
  async findAll() {
    return prisma.package.findMany({
      orderBy: {
        price: "asc",
      },
      include: {
        category: true,
      },
    });
  }

  async findByCategory(categoryId: string) {
    return prisma.package.findMany({
      where: {
        categoryId: categoryId,
      },
      orderBy: {
        price: "asc",
      },
      include: {
        category: true,
      },
    });
  }

  async findByNameOrCategory(nameOrCategory: string) {
    return prisma.package.findFirst({
      where: {
        OR: [
          { name: { equals: nameOrCategory, mode: "insensitive" } },
          {
            category: {
              OR: [
                { name: { equals: nameOrCategory, mode: "insensitive" } },
                { label: { equals: nameOrCategory, mode: "insensitive" } }
              ]
            }
          }
        ]
      },
      include: {
        category: true,
      },
    });
  }

  async createPackage(data: {
    name: string;
    categoryId: string;
    code?: string;
    price: number;
    features: string[];
    description?: string;
    sessionDuration?: number | null;
    imageUrl?: string | null;
    imageStoragePath?: string | null;
    textColor?: string;
    buttonColor?: string;
  }) {
    return prisma.package.create({
      data,
      include: {
        category: true,
      },
    });
  }

  async updatePackage(
    id: string,
    data: {
      name?: string;
      categoryId?: string;
      code?: string;
      price?: number;
      features?: string[];
      description?: string;
      sessionDuration?: number | null;
      imageUrl?: string | null;
      imageStoragePath?: string | null;
      textColor?: string;
      buttonColor?: string;
    }
  ) {
    return prisma.package.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async deletePackage(id: string) {
    return prisma.package.delete({
      where: { id },
    });
  }
}
