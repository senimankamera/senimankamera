import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import fs from "fs";
import path from "path";

try {
  const envPath = path.resolve(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
      const parts = line.split("=");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.error("Failed to load .env manually:", e);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set!");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const rawBookings = await prisma.booking.findMany({
      orderBy: {
        bookingDate: "desc",
      },
      include: {
        client: true,
        paymentTransactions: true,
      },
    });

    const bookings = rawBookings.map((b: any) => ({
      id: b.id,
      client: {
        fullName: b.client.fullName,
        email: b.client.email,
        phoneNumber: b.client.phoneNumber,
      },
      packageType: b.packageType,
      bookingDate: b.bookingDate.toISOString(),
      eventTime: b.eventTime,
      eventName: b.eventName,
      eventLocation: b.eventLocation,
      notes: b.notes,
      status: b.status,
      totalAmount: b.totalAmount || 0,
      dpAmount: b.dpAmount || 0,
      paymentTransactions: b.paymentTransactions.map((t: any) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        createdAt: t.createdAt.toISOString(),
      })),
      createdAt: b.createdAt.toISOString(),
    }));

    console.log("Count:", bookings.length);
    console.log("Bookings:", JSON.stringify(bookings, null, 2));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
