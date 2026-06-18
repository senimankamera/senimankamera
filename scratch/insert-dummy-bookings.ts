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

// Simple UUID helper
function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function main() {
  try {
    const clientObj = await prisma.client.findFirst();
    if (!clientObj) {
      console.error("No client found to associate booking with!");
      return;
    }

    const booking1Id = uuid();
    const bookingMay = await prisma.booking.create({
      data: {
        id: booking1Id,
        clientId: clientObj.id,
        packageType: "Pre-Wedding Silver",
        bookingDate: new Date("2026-05-15T00:00:00.000Z"),
        eventTime: "08:00",
        eventName: "May Wedding Prep",
        eventLocation: "Studio Utama",
        status: "LUNAS",
        paymentStatus: "PAID",
        dpAmount: 300000,
        totalAmount: 1500000,
        paymentTransactions: {
          create: [
            { type: "DP", amount: 300000, uniqueKey: `${booking1Id}-DP` },
            { type: "FULL", amount: 1200000, uniqueKey: `${booking1Id}-FULL` }
          ]
        }
      }
    });
    console.log("Created May Booking:", bookingMay.id);

    const booking2Id = uuid();
    const bookingJuly = await prisma.booking.create({
      data: {
        id: booking2Id,
        clientId: clientObj.id,
        packageType: "Graduation Gold",
        bookingDate: new Date("2026-07-10T00:00:00.000Z"),
        eventTime: "10:00",
        eventName: "July Graduation Ceremony",
        eventLocation: "Aula Universitas",
        status: "APPROVED",
        paymentStatus: "PAID",
        dpAmount: 150000,
        totalAmount: 750000,
        paymentTransactions: {
          create: [
            { type: "DP", amount: 150000, uniqueKey: `${booking2Id}-DP` }
          ]
        }
      }
    });
    console.log("Created July Booking:", bookingJuly.id);

  } catch (error) {
    console.error("Error creating dummy bookings:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
