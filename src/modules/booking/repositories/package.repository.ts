import { prisma } from "@/src/infrastructure/prisma/client";

export class PackageRepository {
  async findAll() {
    return prisma.package.findMany({
      orderBy: {
        price: "asc",
      },
    });
  }

  async findByCategory(category: string) {
    return prisma.package.findMany({
      where: {
        category: {
          equals: category,
          mode: "insensitive",
        },
      },
      orderBy: {
        price: "asc",
      },
    });
  }
}
