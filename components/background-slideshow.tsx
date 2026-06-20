"use client";

import { useEffect, useState } from "react";

interface BackgroundSlideshowProps {
  images: string[];
}

export function BackgroundSlideshow({ images }: BackgroundSlideshowProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 6000); // Change image every 6 seconds

    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-0 w-full h-full overflow-hidden bg-neutral-950 select-none pointer-events-none">
      {images.map((img, idx) => {
        const isActive = idx === index;
        return (
          <div
            key={idx}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-[2500ms] ease-in-out"
            style={{
              backgroundImage: `url('${img}')`,
              opacity: isActive ? 0.45 : 0, // Increased from 0.35 for better visibility
              transform: isActive ? "scale(1.05)" : "scale(1)",
            }}
          />
        );
      })}
      
      {/* Dark Vignette Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/80" />
    </div>
  );
}
