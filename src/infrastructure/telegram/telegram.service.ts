export class TelegramService {
  private token = "8896532615:AAELxB890zX4pTlHztdhIOebqy1zMkJA6Vg";
  private chatId = "-5587757328";

  async sendBookingNotification(booking: {
    fullName: string;
    email: string;
    phoneNumber?: string;
    packageType: string;
    bookingDate: Date;
    notes?: string;
  }) {
    const formattedDate = new Intl.DateTimeFormat("id-ID", {
      dateStyle: "full",
    }).format(booking.bookingDate);

    const message = `
📸 <b>NEW BOOKING INQUIRY</b> 📸
----------------------------------
👤 <b>Nama Klien:</b> ${booking.fullName}
📧 <b>Email:</b> ${booking.email}
📞 <b>No. HP:</b> ${booking.phoneNumber || "-"}
📦 <b>Paket Event:</b> ${booking.packageType}
📅 <b>Tanggal Booking:</b> ${formattedDate}
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
}
