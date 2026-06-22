import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/src/infrastructure/prisma/client";
import { FeaturedCollections } from "@/src/modules/gallery/components/featured-collections";
import { FeaturedTestimonials } from "@/src/modules/gallery/components/featured-testimonials";
import { TestimonialRepository } from "@/src/modules/gallery/repositories/testimonial.repository";

export const revalidate = 0;

export default async function HomePage() {
  let latestGalleries = [];
  let testimonials = [];
  let isDbError = false;

  try {
    const testimonialRepo = new TestimonialRepository();
    const [resGalleries, resTestimonials] = await Promise.all([
      prisma.gallery.findMany({
        where: {
          mediaType: "image",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 6,
      }),
      testimonialRepo.findAll(),
    ]);
    latestGalleries = resGalleries;
    testimonials = resTestimonials;
  } catch (error) {
    console.error("Prisma error during home page generation:", error);
    isDbError = true;
  }

  if (isDbError || (latestGalleries.length === 0 && testimonials.length === 0)) {
    return null;
  }

  const displayItems = latestGalleries;
  const displayTestimonials = testimonials.slice(0, 6);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] md:h-[90vh] bg-neutral-200 overflow-hidden flex flex-col justify-end">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
          style={{
            backgroundImage: `url('/hero.png')`
          }}
        />
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/10 via-transparent to-black/60" />

        {/* Hero Content */}
        <div className="relative z-20 w-full px-6 md:px-20 max-w-[1440px] mx-auto pb-16 md:pb-24 text-white">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl mb-6 leading-tight font-medium">
              Fotografer Bandung.
            </h1>
            <p className="font-sans text-base md:text-lg mb-10 max-w-xl font-light opacity-90 leading-relaxed">
              Capture your Moment before it turns into Memory.
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
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7TrLGopM5nDCga32v2aev2V_AzsZGQobWWhdNhxg7mNfRiPV0PAwfAcmhloMkRLj8IDuIGKRV2I3reKSt5271erYU-haGMrUtibOR14MBJjJFq2z6p2mKeRgnTlaokDyAwZqA7sA0i4ZVU7Ejmexgle-XXIxlxUOi__uXwqEsj5rLfNnAj2WxAIaUGXV2HNP3Pzq1aq69DysPrkz1kb3vyf6amCPyLDo0jIxvPzDFbJdo2HlwYxGF0RxRKY62yO2S-LDQ3DhDZntk"
                alt="Detail shot"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover transition-transform duration-[2s] group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Categories Section */}
      <section className="py-24 md:py-32 bg-muted/50 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 md:px-20 mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
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

      {/* Testimonials Section */}
      <section className="py-24 md:py-32 bg-muted/30 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 md:px-20 mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-secondary mb-3 block font-bold">
              Pengalaman Klien
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-medium">
              Kisah & Kesan Mereka
            </h2>
          </div>
          <Link
            href="/testimonials"
            className="font-sans text-xs uppercase tracking-widest border-b border-primary pb-1 font-bold text-primary hover:opacity-85"
          >
            Lihat Semua Testimoni
          </Link>
        </div>

        {/* Testimonials Slider Row */}
        <FeaturedTestimonials items={displayTestimonials} />
      </section>
    </div>
  );
}
