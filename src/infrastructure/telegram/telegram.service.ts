export class TelegramService {
  private token = process.env.TELEGRAM_BOT_TOKEN || "";
  private chatId = process.env.TELEGRAM_CHAT_ID || "";

  constructor() {
    if (!this.token || !this.chatId) {
      console.warn("Telegram API token or chat ID is missing in environment variables. Telegram notifications will be disabled.");
    }
  }


  async sendBookingNotification(booking: {
    fullName: string;
    email: string;
    phoneNumber?: string;
    packageType: string;
    bookingDate: Date;
    eventTime?: string;
    eventName?: string;
    eventLocation?: string;
    notes?: string;
  }) {
    if (!this.token || !this.chatId) {
      console.log("Skipping Telegram notification because bot token or chat ID is not configured.");
      return;
    }

    const formattedDate = new Intl.DateTimeFormat("id-ID", {
      dateStyle: "full",
    }).format(booking.bookingDate);

    const message = `
📸 <b>PESANAN BOOKING BARU</b> 📸
----------------------------------
👤 <b>Nama Klien:</b> ${booking.fullName}
📧 <b>Email:</b> ${booking.email}
📞 <b>No. HP / WA:</b> ${booking.phoneNumber || "-"}
📦 <b>Paket Event:</b> ${booking.packageType}
📅 <b>Tanggal Booking:</b> ${formattedDate}
⏰ <b>Waktu Acara:</b> ${booking.eventTime || "-"}
🎉 <b>Nama Acara:</b> ${booking.eventName || "-"}
📍 <b>Lokasi Acara:</b> ${booking.eventLocation || "-"}
💰 <b>Jenis Pembayaran:</b> DP 20%
📝 <b>Catatan Vision:</b> ${booking.notes || "-"}
----------------------------------
<i>Silakan tinjau dan konfirmasi di Admin Dashboard.</i>
`;

    const url = `https://api.telegram.org/bot${this.token}/sendMessage`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: "HTML",
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Failed to send Telegram notification:", errText);
      } else {
        console.log("Telegram notification sent successfully!");
      }
    } catch (error) {
      console.error("TelegramService Error:", error);
    }
  }

  async sendBookingStatusNotification(
    clientName: string,
    eventName: string,
    bookingDate: Date,
    status: string
  ) {
    if (!this.token || !this.chatId) {
      console.log("Skipping Telegram notification because bot token or chat ID is not configured.");
      return;
    }

    const formattedDate = new Intl.DateTimeFormat("id-ID", {
      dateStyle: "full",
    }).format(new Date(bookingDate));

    let emoji = "ℹ️";
    let statusText = status.toUpperCase();
    if (status === "APPROVED") {
      emoji = "✅";
      statusText = "DISETUJUI / APPROVED";
    } else if (status === "REJECTED") {
      emoji = "❌";
      statusText = "DITOLAK / REJECTED";
    } else if (status === "CANCELLED") {
      emoji = "🚫";
      statusText = "DIBATALKAN / CANCELLED";
    } else if (status === "LUNAS") {
      emoji = "💰";
      statusText = "LUNAS";
    }

    const message = `
${emoji} <b>STATUS BOOKING DIPERBARUI</b> ${emoji}
----------------------------------
👤 <b>Nama Klien:</b> ${clientName}
🎉 <b>Acara:</b> ${eventName || "-"}
📅 <b>Tanggal Acara:</b> ${formattedDate}
📌 <b>Status Baru:</b> <b>${statusText}</b>
----------------------------------
<i>Status telah diperbarui di Admin Dashboard.</i>
`;

    const url = `https://api.telegram.org/bot${this.token}/sendMessage`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: "HTML",
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Failed to send Telegram status notification:", errText);
      } else {
        console.log("Telegram status notification sent successfully!");
      }
    } catch (error) {
      console.error("TelegramStatusNotification Error:", error);
    }
  }
}

