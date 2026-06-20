import React from "react";
import { prisma } from "@/src/infrastructure/prisma/client";
import { BackgroundSlideshow } from "@/components/background-slideshow";

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.432 2.548 1.233 3.565l-.83 3.033 3.109-.816a5.722 5.722 0 002.254.457h.002c3.18 0 5.767-2.586 5.768-5.766 0-1.54-.599-2.988-1.689-4.079-1.09-1.091-2.538-1.66-4.079-1.66zm3.364 8.163c-.15.42-.77.78-1.07.82-.27.04-.59.05-.98-.07-.24-.07-.57-.19-.97-.37-1.7-.72-2.8-2.47-2.88-2.59-.09-.11-.73-.97-.73-1.85 0-.88.46-1.31.62-1.48.16-.17.35-.21.47-.21.12 0 .24 0 .34.01.11 0 .25-.04.39.3.15.36.51 1.25.56 1.34.05.09.08.2.02.32-.06.12-.09.2-.18.31-.09.11-.19.24-.27.32-.09.1-.19.2-.08.39.11.19.49.81 1.05 1.31.72.64 1.32.84 1.51.93.19.09.3-.02.41-.15.11-.13.49-.57.62-.77.13-.2.27-.17.46-.1.19.07 1.22.58 1.43.68.21.1.35.15.4.24.05.09.05.52-.1.94z" />
    </svg>
  );
}

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.74-.22-.23-.45-.47-.65-.73v7.07c-.02 1.94-.45 3.94-1.62 5.51-1.62 2.16-4.29 3.38-6.99 3.14-2.81-.23-5.56-2.12-6.52-4.78-.96-2.67-.34-5.83 1.57-7.96 1.61-1.79 4.09-2.73 6.49-2.4v4.05c-1.48-.17-3.08.31-3.99 1.52-.92 1.2-1.07 2.88-.45 4.23.63 1.37 2.11 2.27 3.62 2.26 1.61.01 3.17-.98 3.73-2.48.2-.56.29-1.16.28-1.76V0l.02.02z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default async function ContactPage() {
  let bgImages = ["/contact-bg.png", "/hero.png", "/logo.jpg"];
  try {
    const galleries = await prisma.gallery.findMany({
      where: {
        mediaType: "image",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
    });
    if (galleries.length > 0) {
      bgImages = galleries.map((g: any) => g.imageUrl);
    }
  } catch (error) {
    console.error("Failed to fetch gallery backgrounds:", error);
  }

  return (
    <div className="w-full">
      <section className="relative w-full h-[80vh] md:h-[90vh] bg-neutral-200 overflow-hidden flex flex-col justify-end">
        {/* Background Slideshow */}
        <BackgroundSlideshow images={bgImages} />

        {/* Content */}
        <div className="relative z-20 w-full px-6 md:px-20 max-w-[1440px] mx-auto pb-16 md:pb-24 text-white">
          <div className="max-w-3xl">
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-white/60 block mb-4 font-bold">
              Hubungi Kami
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl mb-10 leading-tight font-medium">
              Mulai Kisah Anda.
            </h1>

            {/* Social Media List */}
            <div className="flex flex-col gap-6">

              {/* Instagram */}
              <a
                href="https://www.instagram.com/seniman_kamera4888?igsh=ems1ZzhqeGQ2bGtu"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group hover:opacity-85 transition-all w-fit animate-in fade-in slide-in-from-bottom duration-500"
              >
                <div className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-none group-hover:bg-white/25 transition-all duration-300">
                  <InstagramIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="block font-sans text-[9px] uppercase tracking-[0.2em] text-white/50 font-bold">
                    Instagram
                  </span>
                  <span className="block font-serif text-base md:text-lg text-white group-hover:translate-x-1 transition-transform">
                    @seniman_kamera4888
                  </span>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/6285721598190"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group hover:opacity-85 transition-all w-fit animate-in fade-in slide-in-from-bottom duration-500 delay-75"
              >
                <div className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-none group-hover:bg-white/25 transition-all duration-300">
                  <WhatsAppIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="block font-sans text-[9px] uppercase tracking-[0.2em] text-white/50 font-bold">
                    WhatsApp Owner
                  </span>
                  <span className="block font-serif text-base md:text-lg text-white group-hover:translate-x-1 transition-transform">
                    +62 857-2159-8190 (Zaki Irsyad)
                  </span>
                </div>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@seniman_kamera"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group hover:opacity-85 transition-all w-fit animate-in fade-in slide-in-from-bottom duration-500 delay-150"
              >
                <div className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-none group-hover:bg-white/25 transition-all duration-300">
                  <TikTokIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="block font-sans text-[9px] uppercase tracking-[0.2em] text-white/50 font-bold">
                    TikTok
                  </span>
                  <span className="block font-serif text-base md:text-lg text-white group-hover:translate-x-1 transition-transform">
                    @seniman_kamera4888
                  </span>
                </div>
              </a>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
