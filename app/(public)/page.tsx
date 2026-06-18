import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { prisma } from "@/src/infrastructure/prisma/client";
import { FeaturedCollections } from "@/src/modules/gallery/components/featured-collections";

// Fallback collections if database is empty
const fallbackCollections = [
  {
    id: -1,
    title: "Acara Utama",
    category: "Wedding",
    subCategory: "01 • Pernikahan",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCJtimT1j3d4-PVx7xHWgn2DYhN6L8Bl2myAtaFHOb7r7vn_6oyRX2Dez1gfdnPIcn8GEIOPmOElR3_-u67FhZduHFmBuKSElf1OQ5odoJAGRRdZyYWXvHoFpdlVeFVnLxheHsi5VMHQfzSDFVW781DkEVKgRP729VTSrM7rtO7vLv8M5uOkVLWd2TCSOxNtV6k1jBDj5WqpEcGo0GZjW_HHb0fUM-BNd6KQZk0je79bYXiBo8x1IpOxVj63Xk-XbqAmiAOzi5yTDo",
    aspect: "portrait",
    description: "Fotografi Pernikahan"
  },
  {
    id: -2,
    title: "Langkah Awal",
    category: "Prewedding",
    subCategory: "02 • Pra-nikah",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-dGyIedlUDtzm97T6YxpxDWWpxUE_QtuLSe3hDeKC3kjxRQxur1S3yKKV8Nr4uuVUix1OHq84HAk_oBeqkX2M6bWm-i1VGwXHdkfHKa5EH27HhhlLGNiFq1tDE8iXtAU40WoXAZLQjON19uLRLoa3mCjamhQaFXPoF-1_QdHZl0oQQDHBoD38Zq1cfH8q4U7BkjgM2DnU3iUVnnBDN9zwa4nATgrTBMxY0stb_IztypdpQDNppcSTkfo8JPU7j4z98mJOV1eq8slH",
    aspect: "portrait",
    description: "Fotografi Pra-nikah"
  },
  {
    id: -3,
    title: "Potret Diri",
    category: "Portraits",
    subCategory: "03 • Potret",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-y2iO_u9R60MaruXR8QMXB5m-9Ti8bH4vdhKqR-Okw-QjmIlfkmTsorBjfjLb5_JTqG7IO_4cECBIGlv7WDyKxH-PnA86mkSpgtKb9J8Jo0w1JjTuPmv50xEbhdiVE2RyqGGIdxWPqCzBAt4oVjlhm7J_1v4PRbbUfIxB-N0jqDaqEXeYRUayHLI04KWGB2Kc2B0hNp1mbvjLPomEdL8u2wXa0baYrXHNkuiAuDs4K3S9j7LKM66MVHl19d-mzptdWlDvAe6kdMIE",
    aspect: "portrait",
    description: "Fotografi Potret"
  }
];

export default async function HomePage() {
  const latestGalleries = await prisma.gallery.findMany({
    where: {
      mediaType: "image",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
  });

  const displayItems = latestGalleries.length > 0 ? latestGalleries : fallbackCollections;

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] md:h-[90vh] bg-neutral-200 overflow-hidden flex flex-col justify-end">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
          style={{
            backgroundImage: `url('/logo.png')`
          }}
        />
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/10 via-transparent to-black/60" />

        {/* Hero Content */}
        <div className="relative z-20 w-full px-6 md:px-20 max-w-[1440px] mx-auto pb-16 md:pb-24 text-white">
          <div className="max-w-3xl">
            <span className="font-sans text-xs uppercase tracking-[0.2em] mb-4 block font-bold">
              Sang Seniman di Balik Lensa
            </span>
            <h1 className="font-serif text-5xl md:text-7xl mb-6 leading-tight font-medium">
              Mengabadikan keanggunan yang mendalam.
            </h1>
            <p className="font-sans text-base md:text-lg mb-10 max-w-xl font-light opacity-90 leading-relaxed">
              Fotografi gaya editorial abadi untuk pernikahan, elopement intim, dan acara mewah. Kami membingkai momen paling berharga Anda sebagai karya seni yang tak lekang oleh waktu.
            </p>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-3 border-b border-white pb-2 hover:opacity-75 transition-opacity font-semibold"
            >
              <span>Jelajahi Galeri</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 md:py-32 px-6 md:px-20 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center">
          <div className="md:col-span-6 lg:col-span-5 md:col-start-2">
            <span className="font-sans text-[10px] uppercase tracking-widest text-secondary block mb-4 font-bold">
              Etos Kami
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-primary mb-6 font-medium">
              Intensional. Tenang. Abadi.
            </h2>
            <p className="font-sans text-base md:text-lg text-secondary mb-6 font-light leading-relaxed">
              Pendekatan kami berakar pada observasi, bukan orkestrasi. Kami percaya bahwa gambar yang paling kuat lahir dari interaksi yang jujur, bukan pose yang dipaksakan. Dengan menjaga kehadiran yang tenang dan tidak mengganggu, kami membiarkan keindahan alami kisah Anda mengalir, menangkap momen yang terasa sangat otentik dan bernilai seni tinggi.
            </p>
            <p className="font-sans text-base md:text-lg text-secondary font-light leading-relaxed">
              Setiap bingkai diperlakukan sebagai karya seni murni, dikomposisikan dan diedit dengan cermat untuk memastikan estetika editorial yang kohesif dan akan bertahan selama beberapa dekade.
            </p>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <div className="aspect-[3/4] overflow-hidden bg-muted relative group border border-border/40">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7TrLGopM5nDCga32v2aev2V_AzsZGQobWWhdNhxg7mNfRiPV0PAwfAcmhloMkRLj8IDuIGKRV2I3reKSt5271erYU-haGMrUtibOR14MBJjJFq2z6p2mKeRgnTlaokDyAwZqA7sA0i4ZVU7Ejmexgle-XXIxlxUOi__uXwqEsj5rLfNnAj2WxAIaUGXV2HNP3Pzq1aq69DysPrkz1kb3vyf6amCPyLDo0jIxvPzDFbJdo2HlwYxGF0RxRKY62yO2S-LDQ3DhDZntk"
                alt="Detail shot"
                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Categories Section */}
      <section className="py-24 md:py-32 bg-muted/50 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 md:px-20 mb-12 flex justify-between items-end">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-widest text-secondary block mb-3 font-bold">
              Karya Seni Kami
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-medium">
              Koleksi Pilihan
            </h2>
          </div>
          <Link
            href="/portfolio"
            className="font-sans text-xs uppercase tracking-widest border-b border-primary pb-1 font-bold text-primary hover:opacity-85"
          >
            Lihat Semua Karya
          </Link>
        </div>

        {/* Collections Row */}
        <FeaturedCollections items={displayItems} />
      </section>

      {/* Call to Action Section */}
      <section className="py-32 md:py-48 px-6 md:px-20 text-center" id="contact">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl md:text-6xl text-primary mb-8 font-medium">
            Pesan Karya Seni Anda
          </h2>
          <p className="font-sans text-base md:text-lg text-secondary mb-12 font-light leading-relaxed">
            Kami membatasi jumlah pesanan setiap tahun untuk memastikan kualitas tanpa kompromi dan perhatian khusus kepada setiap klien. Izinkan kami menceritakan kisah Anda.
          </p>
          <a
            href="mailto:hello@senimankamera.com"
            className={cn(
              buttonVariants({ size: "lg" }),
              "font-sans text-xs uppercase tracking-widest px-12 py-7 rounded-none text-center"
            )}
          >
            Tanyakan Ketersediaan
          </a>
        </div>
      </section>
    </div>
  );
}
