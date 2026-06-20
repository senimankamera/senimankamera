import Link from "next/link";
import { ArrowRight, User } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { prisma } from "@/src/infrastructure/prisma/client";
import { FeaturedCollections } from "@/src/modules/gallery/components/featured-collections";
import { TestimonialRepository } from "@/src/modules/gallery/repositories/testimonial.repository";
import { ScrollAnimate } from "@/components/scroll-animate";

export const revalidate = 0;

const fallbackTestimonials = [
  {
    id: "default-1",
    name: "Eleanor & James",
    role: "Pernikahan Destinasi di Tuscany",
    content: "Mereka tidak sekadar mengambil foto; mereka mengabadikan rasa yang sesungguhnya dari hari bahagia itu. Setiap foto tampak seperti cuplikan dari film klasik.",
    avatarUrl: null,
  },
  {
    id: "default-2",
    name: "Sarah Jenkins",
    role: "Klien Sesi Potret Editorial",
    content: "Tingkat profesionalisme dan visi artistik mereka tiada banding. Kami merasa sangat nyaman, dan galeri akhir melampaui ekspektasi terbesar kami.",
    avatarUrl: null,
  },
];

export default async function HomePage() {
  let latestGalleries = [];
  let testimonials = [];

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
  }

  const displayItems = latestGalleries;
  const displayTestimonials = (testimonials.length > 0 ? testimonials : fallbackTestimonials).slice(0, 6);

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
      <section className="py-24 md:py-32 bg-muted/30">
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-20">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-secondary mb-3 block font-bold">
              Pengalaman Klien
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-primary font-medium">
              Kisah & Kesan Mereka
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayTestimonials.map((item: any, idx: number) => {
              const delays = ["delay-[0ms]", "delay-[150ms]", "delay-[300ms]", "delay-[450ms]"];
              const delayClass = delays[idx % delays.length];

              return (
                <ScrollAnimate
                  key={item.id}
                  delay={delayClass}
                  initialClass="opacity-0 scale-95 translate-y-8"
                  animateClass="opacity-100 scale-100 translate-y-0"
                  className="flex"
                >
                  <div className="relative overflow-hidden border border-white/40 bg-card/20 backdrop-blur-sm p-6 md:p-8 flex flex-col justify-between rounded-none w-full hover:border-primary/30 transition-all duration-500 shadow-sm text-center group">
                    {/* Blurred Profile Photo Background */}
                    {item.avatarUrl ? (
                      <div
                        className="absolute inset-0 z-0 bg-cover bg-center blur-[1px] opacity-45 scale-100 transition-transform duration-1000 group-hover:scale-105 pointer-events-none"
                        style={{ backgroundImage: `url("${item.avatarUrl}")` }}
                      />
                    ) : (
                      <div className="absolute inset-0 z-0 bg-gradient-to-b from-neutral-100/50 to-transparent opacity-20 dark:from-neutral-800/30 pointer-events-none" />
                    )}

                    {/* Subtle vignette inner overlay */}
                    <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-card/5 to-card/50 opacity-40 pointer-events-none" />

                    <div className="w-full relative z-10 flex flex-col justify-between h-full">
                      {/* Client Info Block - Centered at the top */}
                      <div className="flex flex-col items-center gap-3 pb-5 border-b border-border/10 mb-5">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-100/80 border border-border/40 flex-shrink-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-105 shadow-sm">
                          {item.avatarUrl ? (
                            <img
                              src={item.avatarUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-secondary/40" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-serif text-sm font-semibold text-primary">
                            {item.name}
                          </h4>
                          {item.role && (
                            <p className="text-[10px] text-secondary font-medium tracking-wide mt-0.5">
                              {item.role}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Content block below inside glassmorphic wrapper */}
                      <div className="bg-card/85 backdrop-blur-md border border-border/20 p-5 rounded-none shadow-sm text-center">
                        <p className="font-sans text-xs sm:text-sm text-secondary italic leading-relaxed">
                          "{item.content}"
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollAnimate>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/testimonials"
              className="inline-block font-sans text-xs uppercase tracking-widest border-b border-primary pb-1 font-bold text-primary hover:opacity-85"
            >
              Lihat Semua Testimoni
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
