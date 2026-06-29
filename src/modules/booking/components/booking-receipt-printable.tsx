"use client";

import React, { forwardRef } from "react";

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

interface BookingReceiptPrintableProps {
  booking: BookingData;
}

export const BookingReceiptPrintable = forwardRef<HTMLDivElement, BookingReceiptPrintableProps>(
  ({ booking }, ref) => {
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

    return (
      <div
        ref={ref}
        className="w-[650px] bg-white text-neutral-900 p-8 border border-neutral-200 font-sans shadow-none"
        style={{ color: "#171717", backgroundColor: "#ffffff" }}
      >
        {/* Header with Logo */}
        <div className="flex justify-between items-center border-b border-neutral-200 pb-6 mb-6">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Seniman Kamera Logo" className="h-14 w-auto object-contain" />
            <div>
              <h1 className="font-serif text-xl font-bold text-neutral-900 tracking-wide uppercase">
                Seniman Kamera
              </h1>
              <p className="text-[11px] text-neutral-500 font-light">
                Editorial & Documentary Photography
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-neutral-900 text-white text-[10px] uppercase font-bold tracking-widest mb-1">
              BUKTI PEMBAYARAN
            </span>
            <p className="text-[10px] text-neutral-500 font-mono">Tgl Cetak: {formattedPrintDate}</p>
          </div>
        </div>

        {/* Invoice Meta Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6 bg-neutral-50 p-4 border border-neutral-100 text-xs">
          <div>
            <span className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider block mb-1">
              Kode Tracking / Booking ID
            </span>
            <span className="font-mono font-bold text-neutral-900 text-sm break-all">{booking.id}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider block mb-1">
              Status Pembayaran
            </span>
            <span className="inline-block px-2.5 py-0.5 bg-green-100 text-green-800 font-bold text-[11px] uppercase tracking-wider border border-green-200">
              {booking.status === "LUNAS" ? "LUNAS" : "DP DITERIMA (PAID)"}
            </span>
          </div>
        </div>

        {/* Client & Booking Details Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
          <div className="space-y-2 border-r border-neutral-100 pr-4">
            <h3 className="font-serif font-bold text-neutral-900 uppercase text-[11px] tracking-wider border-b border-neutral-200 pb-1 mb-2">
              Informasi Pemesan
            </h3>
            <div className="flex justify-between">
              <span className="text-neutral-500">Nama Lengkap:</span>
              <span className="font-semibold text-neutral-900">{booking.client.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Email:</span>
              <span className="font-medium text-neutral-800">{booking.client.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">No. Telepon:</span>
              <span className="font-medium text-neutral-800">{booking.client.phoneNumber || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Instagram:</span>
              <span className="font-medium text-neutral-800">{booking.client.instagram || "-"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-serif font-bold text-neutral-900 uppercase text-[11px] tracking-wider border-b border-neutral-200 pb-1 mb-2">
              Informasi Sesi Foto
            </h3>
            <div className="flex justify-between">
              <span className="text-neutral-500">Paket Foto:</span>
              <span className="font-semibold text-neutral-900">
                {booking.categoryName ? `${booking.categoryName} - ` : ""}
                {booking.packageType}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Nama Acara:</span>
              <span className="font-medium text-neutral-800">{booking.eventName || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Tanggal Sesi:</span>
              <span className="font-semibold text-neutral-900">{formattedBookingDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Waktu Sesi:</span>
              <span className="font-medium text-neutral-800">
                {isTimeBased
                  ? `${booking.sessionStartTime} – ${booking.sessionEndTime} WIB`
                  : booking.eventTime || "-"}
              </span>
            </div>
            {!isTimeBased && booking.eventLocation && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Lokasi Acara:</span>
                <span className="font-medium text-neutral-800 text-right max-w-[160px] truncate">
                  {booking.eventLocation}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary Table */}
        <div className="border border-neutral-200 mb-6 text-xs">
          <div className="bg-neutral-100 px-4 py-2 font-bold text-neutral-700 grid grid-cols-2 border-b border-neutral-200 text-[11px] uppercase tracking-wider">
            <span>Rincian Pembayaran</span>
            <span className="text-right">Jumlah (IDR)</span>
          </div>
          <div className="px-4 py-3 border-b border-neutral-100 grid grid-cols-2">
            <span className="text-neutral-600">Total Biaya Paket ({booking.packageType})</span>
            <span className="text-right font-medium text-neutral-900">
              Rp {(booking.totalAmount || 0).toLocaleString("id-ID")}
            </span>
          </div>
          <div className="px-4 py-3 bg-neutral-50 font-bold grid grid-cols-2 text-sm text-neutral-900">
            <span>Uang Muka Terbayar (DP via DOKU)</span>
            <span className="text-right text-green-700">
              Rp {(booking.dpAmount || 0).toLocaleString("id-ID")}
            </span>
          </div>
          {(booking.totalAmount || 0) > (booking.dpAmount || 0) && (
            <div className="px-4 py-2.5 bg-white text-neutral-500 grid grid-cols-2 text-xs border-t border-neutral-200 italic">
              <span>Sisa Pelunasan (Di lokasi / H-1 sesi)</span>
              <span className="text-right font-semibold text-neutral-700">
                Rp {((booking.totalAmount || 0) - (booking.dpAmount || 0)).toLocaleString("id-ID")}
              </span>
            </div>
          )}
        </div>

        {/* Footer Notes */}
        <div className="border-t border-neutral-200 pt-4 text-[10px] text-neutral-500 leading-relaxed space-y-1">
          <p className="font-bold text-neutral-700 uppercase tracking-wider">Catatan Penting:</p>
          <p>• Dokumen ini merupakan bukti pembayaran resmi yang diterbitkan secara otomatis oleh sistem Seniman Kamera.</p>
          <p>• Mohon lakukan konfirmasi jadwal dan koordinasi teknis via WhatsApp Official Seniman Kamera (0857-2159-8190).</p>
          <p className="pt-2 text-center text-neutral-400 font-serif italic text-[11px]">
            Thank you for trusting Seniman Kamera to capture your timeless moments.
          </p>
        </div>
      </div>
    );
  }
);

BookingReceiptPrintable.displayName = "BookingReceiptPrintable";
