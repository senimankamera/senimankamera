"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollAnimateProps {
  children: React.ReactNode;
  className?: string;
  animateClass?: string;
  initialClass?: string;
  threshold?: number;
  duration?: string;
  delay?: string;
}

export function ScrollAnimate({
  children,
  className,
  animateClass = "opacity-100 scale-100 translate-y-0",
  initialClass = "opacity-0 scale-90 translate-y-12",
  threshold = 0.1,
  duration = "duration-1000",
  delay = "delay-0",
}: ScrollAnimateProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all ease-out",
        duration,
        delay,
        isVisible ? animateClass : initialClass,
        className
      )}
    >
      {children}
    </div>
  );
}
