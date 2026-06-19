"use client";

import { useState } from "react";
import { User, Mail, Phone, BookOpen, MapPin, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

interface StepDataPemesanProps {
  fullName: string;
  email: string;
  phoneNumber: string;
  instagram: string;
  eventName: string;
  eventLocation: string;
  notes: string;
  onChangeFields: (fields: Partial<{
    fullName: string;
    email: string;
    phoneNumber: string;
    instagram: string;
    eventName: string;
    eventLocation: string;
    notes: string;
  }>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepDataPemesan({
  fullName,
  email,
  phoneNumber,
  instagram,
  eventName,
  eventLocation,
  notes,
  onChangeFields,
  onNext,
  onBack,
}: StepDataPemesanProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName || fullName.trim().length < 2) {
      newErrors.fullName = "Nama lengkap harus diisi minimal 2 karakter";
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Format email tidak valid";
    }
    if (!phoneNumber || phoneNumber.trim().length < 8) {
      newErrors.phoneNumber = "Nomor WhatsApp wajib diisi (minimal 8 karakter)";
    }
    if (!instagram || instagram.trim().length === 0) {
      newErrors.instagram = "Instagram wajib diisi (isi '-' jika tidak memiliki Instagram)";
    }
    if (!eventName || eventName.trim().length < 2) {
      newErrors.eventName = "Nama acara harus diisi minimal 2 karakter";
    }
    if (!eventLocation || eventLocation.trim().length < 2) {
      newErrors.eventLocation = "Lokasi acara harus diisi minimal 2 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-md mx-auto">
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-secondary mb-2 block font-bold">
          Langkah 3 dari 5
        </span>
        <h2 className="font-serif text-2xl md:text-3xl text-primary mb-2 font-medium">Data Pemesan & Acara</h2>
        <p className="font-sans text-xs text-secondary font-light leading-relaxed">
          Masukkan detail kontak Anda dan informasi terkait acara yang akan didokumentasikan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 font-sans text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="text-[10px] uppercase tracking-wider text-secondary font-bold block">
              Nama Lengkap Klien <span className="text-red-700">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
              <input
                type="text"
                id="fullName"
                placeholder="misal: Eleanor & James"
                value={fullName}
                onChange={(e) => onChangeFields({ fullName: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-transparent border border-border/40 focus:border-primary focus:outline-none transition-colors rounded-none placeholder:text-secondary/40 text-primary text-xs"
              />
            </div>
            {errors.fullName && <p className="text-xs text-red-700 font-semibold">{errors.fullName}</p>}
          </div>

          {/* WhatsApp / Phone Number */}
          <div className="space-y-1.5">
            <label htmlFor="phoneNumber" className="text-[10px] uppercase tracking-wider text-secondary font-bold block">
              Nomor WhatsApp / HP <span className="text-red-700">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
              <input
                type="tel"
                id="phoneNumber"
                placeholder="misal: 081234567890"
                value={phoneNumber}
                onChange={(e) => onChangeFields({ phoneNumber: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-transparent border border-border/40 focus:border-primary focus:outline-none transition-colors rounded-none placeholder:text-secondary/40 text-primary text-xs"
              />
            </div>
            {errors.phoneNumber && <p className="text-xs text-red-700 font-semibold">{errors.phoneNumber}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-[10px] uppercase tracking-wider text-secondary font-bold block">
              Alamat Email <span className="text-red-700">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
              <input
                type="email"
                id="email"
                placeholder="misal: halo@contoh.com"
                value={email}
                onChange={(e) => onChangeFields({ email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-transparent border border-border/40 focus:border-primary focus:outline-none transition-colors rounded-none placeholder:text-secondary/40 text-primary text-xs"
              />
            </div>
            {errors.email && <p className="text-xs text-red-700 font-semibold">{errors.email}</p>}
          </div>

          {/* Instagram */}
          <div className="space-y-1.5">
            <label htmlFor="instagram" className="text-[10px] uppercase tracking-wider text-secondary font-bold block">
              Username Instagram <span className="text-red-700">*</span>
            </label>
            <div className="relative">
              <InstagramIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
              <input
                type="text"
                id="instagram"
                placeholder="misal: @najmialazhar"
                value={instagram}
                onChange={(e) => onChangeFields({ instagram: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-transparent border border-border/40 focus:border-primary focus:outline-none transition-colors rounded-none placeholder:text-secondary/40 text-primary text-xs"
              />
            </div>
            {errors.instagram && <p className="text-xs text-red-700 font-semibold">{errors.instagram}</p>}
          </div>

          {/* Event Name */}
          <div className="space-y-1.5">
            <label htmlFor="eventName" className="text-[10px] uppercase tracking-wider text-secondary font-bold block">
              Nama Acara / Event <span className="text-red-700">*</span>
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
              <input
                type="text"
                id="eventName"
                placeholder="misal: Wedding Eleanor & James"
                value={eventName}
                onChange={(e) => onChangeFields({ eventName: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-transparent border border-border/40 focus:border-primary focus:outline-none transition-colors rounded-none placeholder:text-secondary/40 text-primary text-xs"
              />
            </div>
            {errors.eventName && <p className="text-xs text-red-700 font-semibold">{errors.eventName}</p>}
          </div>
        </div>

        {/* Event Location */}
        <div className="space-y-1.5">
          <label htmlFor="eventLocation" className="text-[10px] uppercase tracking-wider text-secondary font-bold block">
            Lokasi Acara <span className="text-red-700">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/60" />
            <input
              type="text"
              id="eventLocation"
              placeholder="misal: Hotel Aston Ballroom 1, Bandung"
              value={eventLocation}
              onChange={(e) => onChangeFields({ eventLocation: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-transparent border border-border/40 focus:border-primary focus:outline-none transition-colors rounded-none placeholder:text-secondary/40 text-primary text-xs"
            />
          </div>
          {errors.eventLocation && <p className="text-xs text-red-700 font-semibold">{errors.eventLocation}</p>}
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label htmlFor="notes" className="text-[10px] uppercase tracking-wider text-secondary font-bold block">
            Catatan Kreatif / Tambahan <span className="text-secondary/40 text-[9px] font-normal">(Opsional)</span>
          </label>
          <div className="relative">
            <AlignLeft className="absolute left-3.5 top-3.5 w-4 h-4 text-secondary/60" />
            <textarea
              id="notes"
              rows={4}
              placeholder="Ceritakan detail acara Anda, konsep estetika yang diinginkan, atau request khusus..."
              value={notes}
              onChange={(e) => onChangeFields({ notes: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-transparent border border-border/40 focus:border-primary focus:outline-none transition-colors rounded-none placeholder:text-secondary/40 text-primary resize-none text-xs"
            />
          </div>
        </div>

        {/* Navigation actions */}
        <div className="flex justify-between pt-4 border-t border-border/20">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="font-sans text-xs uppercase tracking-widest py-5 px-8 rounded-none border-border"
          >
            ← Kembali
          </Button>
          <Button
            type="submit"
            className="font-sans text-xs uppercase tracking-widest py-5 px-10 rounded-none font-bold text-white transition-all hover:opacity-90 cursor-pointer"
          >
            Lanjut ke Pembayaran →
          </Button>
        </div>
      </form>
    </div>
  );
}
