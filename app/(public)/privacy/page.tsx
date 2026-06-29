import React from "react";
import type { Metadata } from "next";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Kebijakan Privasi | Seniman Kamera",
  description: "Kebijakan privasi Seniman Kamera mengenai pengumpulan, penggunaan, dan perlindungan data pribadi serta karya fotografi klien.",
};

export default async function PrivacyPage() {
  return (
    <div className="w-full min-h-screen relative flex flex-col justify-center overflow-hidden bg-neutral-950">
      {/* Static Hero Background */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60 pointer-events-none"
        style={{
          backgroundImage: `url('/hero.png')`,
        }}
      />
      {/* Dark Vignette Overlay */}
      <div className="fixed inset-0 z-10 bg-gradient-to-b from-black/40 via-black/30 to-black/80 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-20 w-full px-6 md:px-20 max-w-[1440px] mx-auto py-24 text-white">
        <div className="max-w-4xl mx-auto bg-black/40 backdrop-blur-[2px] border border-white/10 p-8 md:p-16 rounded-none">
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-white/60 block mb-4 font-bold">
            Privasi & Perlindungan Data
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl mb-4 leading-tight font-medium">
            Kebijakan Privasi
          </h1>
          <p className="font-sans text-[11px] uppercase tracking-widest text-white/50 mb-12 font-semibold">
            Terakhir diperbarui: 29 Juni 2026
          </p>

          <div className="font-sans text-sm md:text-base text-white/90 leading-relaxed space-y-8 font-light">
            <p>
              Di Seniman Kamera, kami sangat menghargai dan berkomitmen penuh untuk melindungi privasi serta keamanan data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan menjaga informasi pribadi yang Anda berikan saat menggunakan layanan atau memesan sesi fotografi kami.
            </p>

            <hr className="border-white/10" />

            {/* 1 */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl md:text-2xl text-white font-medium">
                1. Informasi yang Kami Kumpulkan
              </h2>
              <p>
                Untuk memberikan layanan pemotretan dan dokumentasi terbaik, kami mengumpulkan informasi pribadi yang Anda berikan secara langsung saat melakukan formulir reservasi (*booking*), antara lain:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-white font-normal">Identitas Diri:</strong> Nama lengkap dan akun Instagram.</li>
                <li><strong className="text-white font-normal">Informasi Kontak:</strong> Alamat email aktif dan nomor telepon / WhatsApp.</li>
                <li><strong className="text-white font-normal">Detail Sesi Sesi Foto:</strong> Tanggal pemotretan, jam sesi, nama acara/kategori, dan lokasi pemotretan.</li>
                <li><strong className="text-white font-normal">Informasi Transaksi:</strong> Rincian paket yang dipilih dan status pembayaran uang muka (DP).</li>
              </ul>
            </div>

            {/* 2 */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl md:text-2xl text-white font-medium">
                2. Penggunaan Informasi
              </h2>
              <p>
                Informasi yang kami kumpulkan digunakan secara eksklusif untuk keperluan operasional dan pelayanan klien, meliputi:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Memproses reservasi tempat dan jadwal pemotretan pada sistem kami.</li>
                <li>Menerbitkan bukti pembayaran resmi (invoice/receipt) dalam format PDF dan Gambar.</li>
                <li>Melakukan koordinasi teknis, konfirmasi lokasi, dan jadwal persiapan via WhatsApp Official.</li>
                <li>Memungkinkan Anda melakukan pelacakan status pesanan (*order tracking*) mandiri secara aman.</li>
              </ul>
            </div>

            {/* 3 */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl md:text-2xl text-white font-medium">
                3. Kerahasiaan & Perlindungan Data
              </h2>
              <p>
                Kami menerapkan tindakan keamanan teknis dan organisasional yang ketat untuk melindungi data pribadi Anda dari akses yang tidak sah, pengungkapan, perubahan, atau penghancuran.
              </p>
              <p>
                <strong className="text-white font-normal">Seniman Kamera tidak akan pernah menjual, menyewakan, atau mendistribusikan data pribadi Anda kepada pihak ketiga</strong> untuk tujuan pemasaran atau komersial di luar layanan kami.
              </p>
            </div>

            {/* 4 */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl md:text-2xl text-white font-medium">
                4. Hak Cipta & Publikasi Karya
              </h2>
              <p>
                Sebagai studio fotografi editorial dan dokumenter, karya visual yang dihasilkan merupakan bagian dari identitas seni kami:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Secara standar, Seniman Kamera berhak menampilkan hasil karya fotografi/videografi pada portofolio resmi website, majalah studio, dan media sosial kami.</li>
                <li><strong className="text-white font-normal">Hak Privasi Klien:</strong> Apabila Anda menginginkan hasil pemotretan Anda bersifat privat (*Non-Publish*), Anda berhak mengajukan permintaan tertulis kepada tim kami sebelum sesi pemotretan dilaksanakan.</li>
              </ul>
            </div>

            {/* 5 */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl md:text-2xl text-white font-medium">
                5. Penyimpanan Cookies & Teknologi Lokal
              </h2>
              <p>
                Website kami dapat menggunakan penyimpanan lokal (*local storage/cookies*) standar browser untuk mengingat preferensi tampilan dan sesi sistem secara sementara guna meningkatkan kenyamanan pengalaman jelajah Anda.
              </p>
            </div>

            {/* 6 */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl md:text-2xl text-white font-medium">
                6. Hubungi Kami
              </h2>
              <p>
                Apabila Anda memiliki pertanyaan, kekhawatiran, atau permintaan pembaruan terkait Kebijakan Privasi dan data pribadi Anda, silakan hubungi kami melalui:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-white font-normal">WhatsApp Official:</strong> +62 857-2159-8190 (Zaki Irsyad)</li>
                <li><strong className="text-white font-normal">Instagram:</strong> @seniman_kamera4888</li>
              </ul>
            </div>

            <hr className="border-white/10" />

            <p className="font-serif italic text-center text-white/80 pt-4">
              "Privasi dan kepercayaan Anda adalah fondasi utama bagi kami dalam mengabadikan setiap momen berharga Anda."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
