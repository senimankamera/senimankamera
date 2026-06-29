"use client";

import { useState, useRef } from "react";
import { FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BookingReceiptPrintable } from "./booking-receipt-printable";

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

interface BookingReceiptDownloadProps {
  booking: BookingData;
}

export function BookingReceiptDownload({ booking }: BookingReceiptDownloadProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const printableRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      toast.info("Menyiapkan dokumen PDF...");

      // Dynamically import react-pdf to avoid SSR issues
      const { pdf } = await import("@react-pdf/renderer");
      const { BookingReceiptPDF } = await import("./booking-receipt-pdf");

      // Convert logo to Base64 to ensure react-pdf embeds it correctly
      let logoBase64 = "";
      try {
        const logoResp = await fetch("/logo.png");
        const blob = await logoResp.blob();
        logoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.error("Failed to fetch logo for PDF:", e);
      }

      const blob = await pdf(<BookingReceiptPDF booking={booking} logoBase64={logoBase64} />).toBlob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Bukti-Pembayaran-${booking.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Dokumen PDF berhasil diunduh!");
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      toast.error("Gagal mengunduh dokumen PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadImage = async () => {
    try {
      if (!printableRef.current) return;
      setIsGeneratingImage(true);
      toast.info("Menyiapkan gambar bukti pembayaran...");

      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(printableRef.current, { cacheBust: true, pixelRatio: 2 });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Bukti-Pembayaran-${booking.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Gambar bukti pembayaran berhasil diunduh!");
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast.error("Gagal mengunduh gambar bukti pembayaran.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Hidden printable HTML container for image conversion */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px", pointerEvents: "none" }}>
        <BookingReceiptPrintable ref={printableRef} booking={booking} />
      </div>

      <div className="text-left">
        <span className="font-sans text-[10px] uppercase tracking-widest text-secondary font-bold block mb-2">
          Unduh Bukti Pembayaran Resmi
        </span>
        <div className="flex flex-col gap-2.5 w-full">
          <Button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            variant="outline"
            className="rounded-none font-sans text-[10px] uppercase tracking-widest py-5 border-border text-primary hover:bg-neutral-100 flex items-center justify-center gap-2 cursor-pointer font-bold w-full"
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <FileText className="w-4 h-4 text-red-600" />
            )}
            <span>{isGeneratingPdf ? "Mengunduh PDF..." : "Unduh Bukti PDF"}</span>
          </Button>

          <Button
            type="button"
            onClick={handleDownloadImage}
            disabled={isGeneratingImage}
            variant="outline"
            className="rounded-none font-sans text-[10px] uppercase tracking-widest py-5 border-border text-primary hover:bg-neutral-100 flex items-center justify-center gap-2 cursor-pointer font-bold w-full"
          >
            {isGeneratingImage ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <ImageIcon className="w-4 h-4 text-blue-600" />
            )}
            <span>{isGeneratingImage ? "Mengunduh Gambar..." : "Unduh Gambar (PNG)"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
