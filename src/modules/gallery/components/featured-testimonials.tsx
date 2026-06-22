"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TestimonialItem {
  id: string;
  name: string;
  role: string | null;
  content: string;
  avatarUrl: string | null;
}

export function FeaturedTestimonials({ items }: { items: TestimonialItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const itemsCount = items.length;

  // Detect screen size to determine visible items count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setVisibleItems(3);
      } else if (window.innerWidth >= 768) {
        setVisibleItems(2);
      } else {
        setVisibleItems(1);
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, itemsCount - visibleItems);

  // Clamp current index if it becomes out of bounds on screen resize
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex, currentIndex]);

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const firstChild = container.firstElementChild as HTMLElement;
    if (!firstChild) return;

    // Item width including gap of 32px (gap-8 is 32px)
    const itemWidth = firstChild.getBoundingClientRect().width + 32;
    
    isProgrammaticScrollRef.current = true;
    container.scrollTo({
      left: index * itemWidth,
      behavior: "smooth",
    });

    // Reset the programmatic scroll flag after transition is complete
    const timeoutId = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 800);

    return () => clearTimeout(timeoutId);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const next = prev >= maxIndex ? 0 : prev + 1;
      scrollToIndex(next);
      return next;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const next = prev <= 0 ? maxIndex : prev - 1;
      scrollToIndex(next);
      return next;
    });
  };

  // Auto slide every 5 seconds
  useEffect(() => {
    if (itemsCount === 0 || maxIndex === 0) return;
    
    timerRef.current = setInterval(nextSlide, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [itemsCount, maxIndex]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (itemsCount > 0 && maxIndex > 0) {
      timerRef.current = setInterval(nextSlide, 5000);
    }
  };

  const handleScroll = () => {
    // Skip scroll detection if programmatically scrolling
    if (isProgrammaticScrollRef.current) return;
    
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const firstChild = container.firstElementChild as HTMLElement;
    if (!firstChild) return;

    const scrollLeft = container.scrollLeft;
    const itemWidth = firstChild.getBoundingClientRect().width + 32; // item width + gap-8

    const index = Math.round(scrollLeft / itemWidth);
    const clampedIndex = Math.min(Math.max(0, index), maxIndex);

    if (clampedIndex !== currentIndex) {
      setCurrentIndex(clampedIndex);
    }
  };

  if (itemsCount === 0) return null;

  const slidePositionsCount = maxIndex + 1;

  return (
    <div className="relative w-full overflow-hidden">
      {/* Slides Container */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onTouchStart={resetTimer}
        onMouseDown={resetTimer}
        className="flex gap-8 overflow-x-auto snap-x snap-mandatory scroll-smooth full-bleed-carousel py-4 pb-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => {
          const isOddIndex = index % 2 === 1;

          return (
            <div
              key={item.id}
              onClick={resetTimer}
              className={cn(
                "flex-shrink-0 group cursor-pointer select-none px-4 snap-start transition-transform duration-300 flex",
                "w-[82vw] sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)]",
                isOddIndex && "lg:mt-12"
              )}
            >
              <div className="relative overflow-hidden border border-white/40 bg-card/20 backdrop-blur-sm p-6 md:p-8 flex flex-col justify-between rounded-none w-full hover:border-primary/30 transition-all duration-500 shadow-sm text-center">
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
                      "{item.content}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls (Dots & Arrows) */}
      {maxIndex > 0 && (
        <div className="max-w-[1440px] mx-auto px-6 md:px-20 mt-12 flex justify-between items-center">
          {/* Dots Indicators */}
          <div className="flex gap-2">
            {Array.from({ length: slidePositionsCount }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  scrollToIndex(idx);
                  resetTimer();
                }}
                className={`h-1.5 transition-all duration-500 rounded-full bg-primary ${
                  currentIndex === idx ? "w-8 opacity-100" : "w-2 opacity-30"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Button Controls */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                prevSlide();
                resetTimer();
              }}
              className="h-9 w-9 rounded-none border-border"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                nextSlide();
                resetTimer();
              }}
              className="h-9 w-9 rounded-none border-border"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
