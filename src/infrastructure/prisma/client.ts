import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined;
};

const connectionString = process.env.DATABASE_URL;

// Create connection pool and Prisma adapter
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Force recreate client if hot reload holds an old client instance without the new category or paymentTransaction models
if (globalForPrisma.prisma && (!globalForPrisma.prisma.category || !globalForPrisma.prisma.paymentTransaction)) {
  globalForPrisma.prisma = undefined;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
