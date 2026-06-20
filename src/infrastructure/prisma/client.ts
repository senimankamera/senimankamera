import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined;
  pool: pg.Pool | undefined;
};

const connectionString = process.env.DATABASE_URL;

// Re-use pg Pool in development to prevent dangling database connection leaks on Fast Refresh
let pool: pg.Pool;
if (process.env.NODE_ENV !== "production") {
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new pg.Pool({ connectionString });
  }
  pool = globalForPrisma.pool;
} else {
  pool = new pg.Pool({ connectionString });
}

const adapter = new PrismaPg(pool);

// Force recreate client if hot reload holds an old client instance without the new category, paymentTransaction, or testimonial models
if (globalForPrisma.prisma && (!globalForPrisma.prisma.category || !globalForPrisma.prisma.paymentTransaction || !globalForPrisma.prisma.testimonial)) {
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
