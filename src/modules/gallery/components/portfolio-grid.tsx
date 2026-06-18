"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  subCategory: string;
  imageUrl: string;
  aspect: string;
  description?: string | null;
}

interface CategoryItem {
  id: string;
  name: string;
  label: string;
}

interface PortfolioGridProps {
  initialItems: GalleryItem[];
  categories?: CategoryItem[];
}

export function PortfolioGrid({ initialItems, categories: dbCategories }: PortfolioGridProps) {
  const [activeFilter, setActiveFilter] = useState("All");

  const fallbackCategories = ["All", "Wedding", "Prewedding", "Graduation", "Portraits", "Events"];
  const fallbackLabels: Record<string, string> = {
    All: "Semua",
    Wedding: "Pernikahan",
    Prewedding: "Pranikah",
    Graduation: "Wisuda",
    Portraits: "Potret",
    Events: "Acara",
  };

  const categories = dbCategories && dbCategories.length > 0
    ? ["All", ...dbCategories.map(c => c.name)]
    : fallbackCategories;

  const categoryLabels: Record<string, string> = dbCategories && dbCategories.length > 0
    ? dbCategories.reduce<Record<string, string>>(
        (acc, curr) => {
          acc[curr.name] = curr.label;
          return acc;
        },
        { All: "Semua" }
      )
    : fallbackLabels;

  const filteredItems = activeFilter === "All"
    ? initialItems
    : initialItems.filter(item => item.category === activeFilter);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 md:px-20 py-12 md:py-20">
      {/* Header Section */}
      <section className="flex flex-col items-center text-center mb-16 max-w-2xl mx-auto">
        <h1 className="font-serif text-4xl md:text-6xl text-primary mb-4 font-medium">
          Karya Pilihan
        </h1>
        <p className="font-sans text-base md:text-lg text-secondary font-light leading-relaxed">
          Koleksi momen berharga yang diabadikan melalui lensa, memadukan keindahan cahaya dan emosi dalam gaya editorial yang elegan.
        </p>
      </section>

      {/* Filter Options */}
      <section className="flex flex-wrap justify-center gap-4 md:gap-8 mb-16 border-b border-border/40 pb-6 font-sans text-xs uppercase tracking-widest font-bold">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={cn(
              "pb-1 transition-all duration-300 cursor-pointer",
              activeFilter === cat
                ? "text-primary border-b border-primary"
                : "text-secondary hover:text-primary"
            )}
          >
            {categoryLabels[cat] || cat}
          </button>
        ))}
      </section>

      {/* Masonry-Style Grid using CSS Columns */}
      <section className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="break-inside-avoid group cursor-pointer flex flex-col mb-8"
          >
            <div
              className={cn(
                "w-full overflow-hidden bg-muted relative border border-border/30 mb-4",
                item.aspect === "portrait" && "aspect-[3/4]",
                item.aspect === "square" && "aspect-square",
                item.aspect === "wide" && "aspect-[16/9]"
              )}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-[0.8s] group-hover:scale-105"
              />
            </div>
            <div>
              <span className="font-sans text-[10px] uppercase tracking-widest text-secondary block mb-1 font-bold">
                {item.subCategory}
              </span>
              <h3 className="font-serif text-xl md:text-2xl text-primary font-medium">
                {item.title}
              </h3>
              {item.description && (
                <p className="font-sans text-xs text-secondary mt-2 font-light leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </section>


    </div>
  );
}
