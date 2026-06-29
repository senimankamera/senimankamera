/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles: Record<string, any> = {
  page: { padding: 36, fontFamily: "Helvetica", fontSize: 10, color: "#171717", backgroundColor: "#ffffff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#e5e5e5", paddingBottom: 16, marginBottom: 20 },
  logoSection: { flexDirection: "row", alignItems: "center" },
  logo: { width: 50, height: 50, marginRight: 12 },
  titleGroup: { flexDirection: "column" },
  brandTitle: { fontSize: 16, fontFamily: "Helvetica-Bold", letterSpacing: 1, textTransform: "uppercase", color: "#0f172a" },
  brandSubtitle: { fontSize: 8, color: "#64748b", marginTop: 2 },
  badgeSection: { alignItems: "flex-end" },
  badge: { backgroundColor: "#0f172a", color: "#ffffff", fontSize: 8, fontFamily: "Helvetica-Bold", paddingHorizontal: 8, paddingVertical: 4, marginBottom: 4 },
  printDate: { fontSize: 8, color: "#94a3b8" },
  metaGrid: { flexDirection: "row", backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#f1f5f9", padding: 12, marginBottom: 20 },
  metaCol: { flex: 1 },
  metaLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#94a3b8", textTransform: "uppercase", marginBottom: 3 },
  metaValueId: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#0f172a" },
  metaValuePaid: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#166534", backgroundColor: "#dcfce7", paddingHorizontal: 6, paddingVertical: 2, alignSelf: "flex-start" },
  detailsGrid: { flexDirection: "row", marginBottom: 20 },
  detailsColLeft: { flex: 1, paddingRight: 10 },
  detailsColRight: { flex: 1, paddingLeft: 10 },
  sectionHeading: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#0f172a", textTransform: "uppercase", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 4, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  label: { color: "#64748b", fontSize: 9 },
  value: { fontFamily: "Helvetica-Bold", color: "#0f172a", fontSize: 9, textAlign: "right" },
  table: { borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 20 },
  tableHeader: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#f1f5f9", paddingHorizontal: 12, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  tableHeaderTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#475569", textTransform: "uppercase" },
  tableRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  tableRowHighlight: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#f8fafc", paddingHorizontal: 12, paddingVertical: 10 },
  totalLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#0f172a" },
  totalValue: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#15803d" },
  footer: { borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 12, marginTop: 10 },
  footerTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#334155", textTransform: "uppercase", marginBottom: 4 },
  footerText: { fontSize: 8, color: "#64748b", lineHeight: 1.4, marginBottom: 2 },
  thankYou: { fontSize: 9, fontFamily: "Helvetica-Oblique", color: "#94a3b8", textAlign: "center", marginTop: 16 }
};

interface ClientData {
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  instagram?: string | null;
}

interface BookingData {
  id: string;
  packageType: string;
  bookingDate: string | Date;
  eventTime?: string | null;
  eventName?: string | null;
  eventLocation?: string | null;
  status: string;
  dpAmount?: number | null;
  totalAmount?: number | null;
  sessionStartTime?: string | null;
  sessionEndTime?: string | null;
  client: ClientData;
  categoryName?: string | null;
}

interface BookingReceiptPDFProps {
  booking: BookingData;
  logoBase64?: string;
}

export const BookingReceiptPDF = ({ booking, logoBase64 }: BookingReceiptPDFProps) => {
  const isTimeBased = !!booking.sessionStartTime;
  const formattedBookingDate = new Date(booking.bookingDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedPrintDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const logoSrc = logoBase64 || "/logo.png";
  const docTitle = "Bukti-Pembayaran-" + booking.id + ".pdf";
  const pkgText = (booking.categoryName ? booking.categoryName + " - " : "") + booking.packageType;
  const timeText = isTimeBased ? booking.sessionStartTime + " – " + booking.sessionEndTime + " WIB" : (booking.eventTime || "-");
  const dpText = "Rp " + (booking.dpAmount || 0).toLocaleString("id-ID");
  const totalText = "Rp " + (booking.totalAmount || 0).toLocaleString("id-ID");
  const statusText = booking.status === "LUNAS" ? "LUNAS" : "DP DITERIMA (PAID)";

  return (
    <Document title={docTitle}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image src={logoSrc} style={styles.logo} />
            <View style={styles.titleGroup}>
              <Text style={styles.brandTitle}>Seniman Kamera</Text>
              <Text style={styles.brandSubtitle}>Editorial & Documentary Photography</Text>
            </View>
          </View>
          <View style={styles.badgeSection}>
            <Text style={styles.badge}>BUKTI PEMBAYARAN</Text>
            <Text style={styles.printDate}>Tgl Cetak: {formattedPrintDate}</Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Kode Tracking / Booking ID</Text>
            <Text style={styles.metaValueId}>{booking.id}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Status Pembayaran</Text>
            <Text style={styles.metaValuePaid}>{statusText}</Text>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailsColLeft}>
            <Text style={styles.sectionHeading}>Informasi Pemesan</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Nama Lengkap:</Text>
              <Text style={styles.value}>{booking.client.fullName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{booking.client.email}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>No. Telepon:</Text>
              <Text style={styles.value}>{booking.client.phoneNumber || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Instagram:</Text>
              <Text style={styles.value}>{booking.client.instagram || "-"}</Text>
            </View>
          </View>

          <View style={styles.detailsColRight}>
            <Text style={styles.sectionHeading}>Informasi Sesi Foto</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Paket Foto:</Text>
              <Text style={styles.value}>{pkgText}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Nama Acara:</Text>
              <Text style={styles.value}>{booking.eventName || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Tanggal Sesi:</Text>
              <Text style={styles.value}>{formattedBookingDate}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Waktu Sesi:</Text>
              <Text style={styles.value}>{timeText}</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderTitle}>Rincian Pembayaran</Text>
            <Text style={styles.tableHeaderTitle}>Jumlah (IDR)</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.label}>Total Biaya Paket ({booking.packageType})</Text>
            <Text style={styles.value}>{totalText}</Text>
          </View>
          <View style={styles.tableRowHighlight}>
            <Text style={styles.totalLabel}>Uang Muka Terbayar (DP via DOKU)</Text>
            <Text style={styles.totalValue}>{dpText}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Catatan Penting:</Text>
          <Text style={styles.footerText}>
            • Dokumen ini merupakan bukti pembayaran resmi yang diterbitkan secara otomatis oleh sistem Seniman Kamera.
          </Text>
          <Text style={styles.footerText}>
            • Mohon lakukan konfirmasi jadwal dan koordinasi teknis via WhatsApp Official Seniman Kamera (0857-2159-8190).
          </Text>
          <Text style={styles.thankYou}>
            Thank you for trusting Seniman Kamera to capture your timeless moments.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
