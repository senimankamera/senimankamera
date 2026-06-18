import fs from "fs";
import path from "path";

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

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

console.log("Token:", token ? `${token.substring(0, 10)}...` : "MISSING!");
console.log("Chat ID:", chatId || "MISSING!");

async function main() {
  if (!token || !chatId) {
    console.error("Telegram credentials not set!");
    return;
  }

  const message = `
📸 <b>PESANAN BOOKING TELAH DIBAYAR (APPROVED)</b> 📸
----------------------------------
👤 <b>Nama Klien:</b> Najmi Shofwan Al-Azhar
📧 <b>Email:</b> najmishfwn@gmail.com
📞 <b>No. HP / WA:</b> 083832376353
📦 <b>Paket Event:</b> Basic Studio
📅 <b>Tanggal Booking:</b> Kamis, 3 Juli 2026
⏰ <b>Waktu Acara:</b> 08:00 WIB
🎉 <b>Nama Acara:</b> Foto Studio Session
📍 <b>Lokasi Acara:</b> Studio
💰 <b>Uang Muka (DP):</b> Rp150.000 (dari Total: Rp350.000)
📝 <b>Catatan:</b> -
----------------------------------
<i>Pesanan telah diverifikasi dan disetujui secara otomatis melalui sistem payment gateway.</i>
`;

  console.log("\nMengirim pesan ke Telegram...");
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    }),
  });

  const result = await response.json() as any;
  if (result.ok) {
    console.log("✅ Berhasil! Pesan terkirim ke Telegram.");
  } else {
    console.error("❌ Gagal:", JSON.stringify(result, null, 2));
  }
}

main().catch(console.error);
