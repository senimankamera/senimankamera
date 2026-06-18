import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import crypto from "crypto";

// Load .env
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
  console.error("Failed to load .env:", e);
}

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Priority 1: Find the latest PENDING booking (just paid via Midtrans Simulator but webhook didn't reach localhost)
  const pendingBooking = await prisma.booking.findFirst({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: { client: true, paymentTransactions: true },
  });

  if (pendingBooking) {
    console.log(`\n📦 Booking PENDING terbaru ditemukan (baru saja dibayar via Simulator):`);
    console.log(`  ID       : ${pendingBooking.id}`);
    console.log(`  Klien    : ${pendingBooking.client.fullName}`);
    console.log(`  Paket    : ${pendingBooking.packageType}`);
    console.log(`  DP       : Rp ${pendingBooking.dpAmount?.toLocaleString("id-ID")}`);
    await triggerWebhook(pendingBooking);
    return;
  }

  // Priority 2: Find APPROVED booking without PaymentTransaction
  const approvedNoTx = await prisma.booking.findFirst({
    where: {
      status: "APPROVED",
      paymentTransactions: { none: {} },
    },
    orderBy: { createdAt: "desc" },
    include: { client: true, paymentTransactions: true },
  });

  if (approvedNoTx) {
    console.log(`\n📦 Booking APPROVED tanpa PaymentTransaction:`);
    console.log(`  ID       : ${approvedNoTx.id}`);
    console.log(`  Klien    : ${approvedNoTx.client.fullName}`);
    console.log(`  Paket    : ${approvedNoTx.packageType}`);
    await triggerWebhook(approvedNoTx);
    return;
  }

  console.log("✅ Tidak ada booking baru yang perlu diproses. Semua sudah APPROVED dengan PaymentTransaction.");
}

async function triggerWebhook(booking: any) {
  const orderId = booking.id;
  const statusCode = "200";
  const grossAmount = String(Math.round(booking.dpAmount || 0)) + ".00";
  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";

  const signatureSource = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const signatureKey = crypto.createHash("sha512").update(signatureSource).digest("hex");

  const payload = {
    order_id: orderId,
    status_code: statusCode,
    gross_amount: grossAmount,
    signature_key: signatureKey,
    transaction_status: "settlement",
    fraud_status: "accept",
  };

  console.log(`\nMengirim simulasi webhook settlement ke server lokal...`);
  const response = await fetch("http://localhost:3000/api/payment/notification", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await response.json();
  console.log(`HTTP ${response.status}:`, body);
  if (response.ok) {
    console.log("\n✅ Webhook berhasil! Cek Telegram Anda untuk notifikasi bot.");
  } else {
    console.log("\n❌ Webhook gagal diterima server.");
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
