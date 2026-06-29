import React from "react";

export const revalidate = 0;

export default async function TermsPage() {
  return (
    <div className="w-full min-h-screen relative flex flex-col justify-center overflow-hidden bg-neutral-950">
      {/* Static Hero Background */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60 pointer-events-none"
        style={{
          backgroundImage: `url('/hero.png')`
        }}
      />
      {/* Dark Vignette Overlay */}
      <div className="fixed inset-0 z-10 bg-gradient-to-b from-black/40 via-black/30 to-black/80 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-20 w-full px-6 md:px-20 max-w-[1440px] mx-auto py-24 text-white">
        <div className="max-w-4xl mx-auto bg-black/40 backdrop-blur-[2px] border border-white/10 p-8 md:p-16 rounded-none">
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-white/60 block mb-4 font-bold">
            Kebijakan Studio
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl mb-4 leading-tight font-medium">
            Ketentuan Layanan
          </h1>
          <p className="font-sans text-[11px] uppercase tracking-widest text-white/50 mb-12 font-semibold">
            Terakhir diperbarui: 20 Juni 2026
          </p>

          <div className="font-sans text-sm md:text-base text-white/90 leading-relaxed space-y-8 font-light">
            <p>
              Selamat datang di Seniman Kamera. Dengan mengakses website dan menggunakan layanan kami, Anda dianggap telah membaca, memahami, dan menyetujui seluruh Ketentuan Layanan yang berlaku.
            </p>

            <hr className="border-white/10" />

            {/* 1 */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl md:text-2xl text-white font-medium">1. Tentang Layanan</h2>
              <p>
                Seniman Kamera menyediakan layanan fotografi dan dokumentasi visual, termasuk namun tidak terbatas pada sesi studio, foto keluarga, wisuda, prewedding, produk, acara, dan layanan lainnya yang tersedia pada website.
              </p>
              <p>
                Layanan dapat dipesan secara online melalui sistem booking yang tersedia pada website.
              </p>
            </div>

            {/* 2 */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl md:text-2xl text-white font-medium">2. Persetujuan Pengguna</h2>
              <p>
                Dengan menggunakan website Seniman Kamera, pengguna menyatakan bahwa:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Memberikan informasi yang benar, lengkap, dan akurat.</li>
                <li>Memiliki kapasitas hukum untuk melakukan pemesanan.</li>
                <li>Bersedia mematuhi seluruh ketentuan yang berlaku.</li>
                <li>Tidak menggunakan website untuk tujuan yang melanggar hukum.</li>
              </ul>
            </div>

            {/* 3 */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl md:text-2xl text-white font-medium">3. Pemesanan Layanan</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Pemesanan dilakukan melalui sistem booking yang tersedia pada website.</li>
                <li>Ketersediaan jadwal bersifat dinamis dan dapat berubah sewaktu-waktu sebelum pembayaran dikonfirmasi.</li>
                <li>
                  Detail pembayaran, uang muka (DP), pelunasan, pembatalan, dan penjadwalan ulang (reschedule) diatur dalam halaman{" "}
                  <span className="font-semibold text-white">Syarat & Ketentuan Pemesanan</span> yang ditampilkan saat checkout.
                </li>
              </ul>
            </div>

            {/* 4 */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl md:text-2xl text-white font-medium">4. Harga dan Pembayaran</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Seluruh harga yang ditampilkan pada website menggunakan mata uang Rupiah (IDR).</li>
                <li>Seniman Kamera berhak melakukan perubahan harga tanpa pemberitahuan sebelumnya untuk pemesanan baru.</li>
                <li>Harga yang telah dikonfirmasi pada pesanan yang sudah disetujui tidak akan berubah kecuali terdapat permintaan tambahan dari Klien.</li>
              </ul>
            </div>

            {/* 5 */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl md:text-2xl text-white font-medium">5. Hak dan Kewajiban Klien</h2>
              <p className="font-semibold text-white">Klien berhak untuk:</p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>Mendapatkan layanan sesuai paket yang dipilih.</li>
                <li>Menerima hasil foto atau video sesuai estimasi yang diinformasikan.</li>
                <li>Mendapatkan informasi yang jelas mengenai layanan yang dipesan.</li>
              </ul>

              <p className="font-semibold text-white">Klien berkewajiban untuk:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Memberikan data yang akurat saat melakukan pemesanan.</li>
                <li>Hadir sesuai jadwal yang telah disepakati.</li>
                <li>Menjaga komunikasi yang baik selama proses pemesanan dan pelaksanaan sesi.</li>
                <li>Mematuhi aturan lokasi pemotretan yang digunakan.</li>
              </ul>
            </div>

            {/* 6 */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl md:text-2xl text-white font-medium">6. Hak Kekayaan Intelektual</h2>
              <p>
                Seluruh konten yang terdapat pada website, termasuk logo, desain, teks, foto, video, dan materi visual lainnya merupakan milik Seniman Kamera atau digunakan secara sah berdasarkan izin yang berlaku.
              </p>
              <p>
                Dilarang menyalin, didistribusikan, memodifikasi, atau menggunakan konten website tanpa izin tertulis dari Seniman Kamera.
              </p>
            </div>

            {/* 7 */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl md:text-2xl text-white font-medium">7. Penggunaan Hasil Karya</h2>
              <p>Kecuali disepakati secara tertulis:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Hak cipta atas hasil foto dan video tetap dimiliki oleh Seniman Kamera.</li>
                <li>Klien memperoleh hak penggunaan pribadi atas hasil yang diterima.</li>
                <li>Seniman Kamera dapat menggunakan hasil karya untuk kebutuhan promosi, portofolio, media sosial, atau publikasi lainnya.</li>
              </ul>
              <p>
                Apabila Klien menginginkan hasil karya tidak dipublikasikan, permintaan tersebut harus disampaikan sebelum pelaksanaan sesi.
              </p>
            </div>

            {/* 8 */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl md:text-2xl text-white font-medium">8. Batas Tanggung Jawab</h2>
              <p>Seniman Kamera berupaya memberikan layanan terbaik, namun tidak bertanggung jawab atas:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Gangguan layanan akibat masalah jaringan internet atau sistem pihak ketiga.</li>
                <li>Kerugian tidak langsung yang timbul akibat penggunaan website.</li>
                <li>Keterlambatan yang disebabkan oleh kondisi di luar kendali yang wajar.</li>
                <li>Kehilangan kesempatan bisnis, keuntungan, atau kerugian konsekuensial lainnya.</li>
              </ul>
            </div>

            {/* 9 */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl md:text-2xl text-white font-medium">9. Keadaan Kahar (Force Majeure)</h2>
              <p>
                Seniman Kamera tidak dapat dianggap melanggar perjanjian apabila keterlambatan atau kegagalan pelaksanaan layanan disebabkan oleh keadaan di luar kendali yang wajar, termasuk namun tidak terbatas pada:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Bencana alam, kebakaran, gangguan listrik skala besar, kerusuhan, pandemi, atau kebijakan pemerintah.</li>
                <li>Kondisi cuaca ekstrem yang membahayakan pelaksanaan sesi pemotretan.</li>
              </ul>
            </div>

            {/* 10 */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl md:text-2xl text-white font-medium">10. Privasi Data</h2>
              <p>Informasi yang diberikan oleh pengguna digunakan untuk:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Pemrosesan pemesanan dan komunikasi terkait layanan.</li>
                <li>Administrasi, operasional bisnis, dan peningkatan kualitas layanan.</li>
              </ul>
              <p>
                Seniman Kamera berkomitmen menjaga kerahasiaan data pengguna sesuai dengan Kebijakan Privasi yang berlaku.
              </p>
            </div>

            {/* 11 */}
            <div className="space-y-3">
              <h2 className="font-serif text-xl md:text-2xl text-white font-medium">11. Perubahan Ketentuan</h2>
              <p>
                Seniman Kamera berhak mengubah atau memperbarui Ketentuan Layanan ini sewaktu-waktu. Perubahan akan berlaku sejak dipublikasikan pada website. Pengguna disarankan untuk meninjau halaman ini secara berkala.
              </p>
            </div>
            <hr className="border-white/10" />

            <p className="font-serif italic text-center text-white/80 pt-4">
              "Dengan menggunakan website dan layanan Seniman Kamera, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh Ketentuan Layanan ini."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
