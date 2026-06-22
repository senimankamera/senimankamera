import { User } from "lucide-react";
import Image from "next/image";
import { TestimonialRepository } from "@/src/modules/gallery/repositories/testimonial.repository";
import { ScrollAnimate } from "@/components/scroll-animate";
import type { Metadata } from "next";
import { Testimonial } from "@prisma/client";

export const revalidate = 0; // Disable static cache to reflect database changes dynamically

export const metadata: Metadata = {
  title: "Testimonial | Seniman Kamera",
  description: "Cerita dan testimoni kepuasan dari klien yang telah mempercayakan momen berharga mereka kepada Seniman Kamera.",
};

export default async function TestimonialsPage() {
  let testimonials: Testimonial[] = [];
  let isDbError = false;
  
  try {
    const testimonialRepo = new TestimonialRepository();
    testimonials = await testimonialRepo.findAll();
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    isDbError = true;
  }

  if (isDbError || testimonials.length === 0) {
    return null;
  }

  const displayTestimonials = testimonials;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 md:px-20 py-12 md:py-20">
      {/* Header Section (Matching Portfolio style) */}
      <section className="flex flex-col items-center text-center mb-16 max-w-2xl mx-auto">
        <span className="font-sans text-[10px] uppercase tracking-widest text-secondary block mb-4 font-bold">
          Pengalaman Klien
        </span>
        <h1 className="font-serif text-4xl md:text-6xl text-primary mb-4 font-medium">
          Testimoni Klien
        </h1>
        <p className="font-sans text-base md:text-lg text-secondary font-light leading-relaxed">
          Koleksi kesan, pesan, dan cerita berharga dari para klien yang telah mempercayakan momen indah mereka kepada kami.
        </p>
      </section>

      {/* Grid Layout (Matching Portfolio structural feel) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayTestimonials.map((item, idx: number) => {
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
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-neutral-100/80 border border-border/40 flex-shrink-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-105 shadow-sm relative">
                      {item.avatarUrl ? (
                        <Image
                          src={item.avatarUrl}
                          alt={item.name}
                          width={56}
                          height={56}
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
                      &quot;{item.content}&quot;
                    </p>
                  </div>
                </div>
              </div>
            </ScrollAnimate>
          );
        })}
      </section>
    </div>
  );
}
