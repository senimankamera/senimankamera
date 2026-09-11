"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Sparkles, ArrowRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryItem {
  id: string;
  name: string;
  label: string;
  description: string | null;
  bookingType?: string;
}

interface PackageItem {
  id: string;
  name: string;
  categoryId: string;
  category?: CategoryItem | null;
  price: number;
  features: string[];
  description: string | null;
  imageUrl?: string | null;
  imageStoragePath?: string | null;
  textColor?: string | null;
  buttonColor?: string | null;
}

function isHexColorLight(color?: string | null): boolean {
  if (!color || color === "DEFAULT") return false;
  if (color === "LIGHT") return true;
  if (color === "DARK") return false;
  
  const hex = color.replace("#", "");
  if (hex.length !== 6) return false;
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
  );

  return hsp > 127.5;
}

interface PricingCatalogProps {
  initialPackages: PackageItem[];
  categories: CategoryItem[];
}

export function PricingCatalog({ initialPackages, categories }: PricingCatalogProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const scrollToCategory = (catId: string) => {
    setActiveTab(catId);
    const el = document.getElementById(`category-${catId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="w-full space-y-16">
      {/* Quick Navigation Anchor Bar */}
      <div className="sticky top-20 z-30 bg-background/90 backdrop-blur-md py-4 border-b border-border/30 mb-8">
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-[1440px] mx-auto px-4">
          <span className="text-[10px] uppercase tracking-widest text-secondary font-bold mr-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Kategori:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={cn(
                "px-4 py-2 font-sans text-xs uppercase tracking-wider font-bold transition-all duration-200 border rounded-none cursor-pointer",
                activeTab === cat.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border/40 hover:border-primary/50"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Categories and Packages Catalog */}
      <div className="space-y-24">
        {categories.map((cat) => {
          const catPackages = initialPackages.filter((pkg) => pkg.categoryId === cat.id);
          const categoryName = cat.name.toLowerCase();
          const isWedding = categoryName === "wedding";

          return (
            <section
              key={cat.id}
              id={`category-${cat.id}`}
              className="scroll-mt-32 space-y-8 border-b border-border/20 pb-16 last:border-0"
            >
              {/* Category Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-2 border-primary pl-4 md:pl-6 py-1">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-secondary font-bold">
                      Kategori Layanan
                    </span>
                    <span className={cn(
                      "font-sans text-[8px] uppercase tracking-wider px-2 py-0.5 font-bold border rounded-none leading-none",
                      cat.bookingType === "TIME_BASED"
                        ? "border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
                        : "border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30"
                    )}>
                      {cat.bookingType === "TIME_BASED" ? "Pemesanan Per Jam" : "Pemesanan Harian"}
                    </span>
                  </div>
                  <h2 className="font-serif text-3xl md:text-4xl text-primary font-medium">
                    {cat.label}
                  </h2>
                </div>
                {cat.description && (
                  <p className="font-sans text-xs md:text-sm text-secondary font-light max-w-xl leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>

              {/* Package Grid */}
              {catPackages.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border/40 text-secondary font-sans text-xs bg-muted/10">
                  Belum ada paket yang tersedia untuk kategori {cat.label}.
                </div>
              ) : (
                <div className={cn(
                  "grid gap-8 items-start",
                  catPackages.length === 1
                    ? "grid-cols-1 max-w-[380px]"
                    : catPackages.length === 2
                      ? "grid-cols-1 md:grid-cols-2 max-w-[800px]"
                      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                )}>
                  {catPackages.map((pkg) => {
                    const hasBg = !!pkg.imageUrl;
                    const isCustomColor = pkg.textColor && pkg.textColor.startsWith("#");

                    const isLightText = isCustomColor 
                      ? isHexColorLight(pkg.textColor)
                      : (pkg.textColor === "LIGHT" || 
                         (pkg.textColor === "DEFAULT" && isWedding) ||
                         (!pkg.textColor && isWedding) ||
                         (hasBg && pkg.textColor !== "DARK"));

                    const customStyle = isCustomColor ? { color: pkg.textColor! } : undefined;

                    const isCustomButtonColor = pkg.buttonColor && pkg.buttonColor.startsWith("#");
                    const buttonStyle = isCustomButtonColor 
                      ? { 
                          backgroundColor: pkg.buttonColor!, 
                          color: isHexColorLight(pkg.buttonColor) ? "#000000" : "#ffffff",
                          border: "1px solid",
                          borderColor: isHexColorLight(pkg.buttonColor) ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)"
                        } 
                      : undefined;

                    return (
                      <div
                        key={pkg.id}
                        className={cn(
                          "border transition-all duration-300 shadow-sm relative flex flex-col justify-between w-full max-w-[380px] aspect-[4/5] mx-auto p-6 md:p-8 hover:-translate-y-1 overflow-hidden",
                          hasBg 
                            ? "bg-neutral-900 border-neutral-800" 
                            : isWedding
                              ? "bg-neutral-950 border-neutral-800 text-neutral-100"
                              : "bg-card border-border/40 text-foreground"
                        )}
                      >
                        {/* Background Image */}
                        {hasBg && (
                          <Image 
                            src={pkg.imageUrl!} 
                            alt={pkg.name} 
                            fill
                            sizes="(max-width: 768px) 100vw, 30vw"
                            className="object-cover z-0 transition-transform duration-700 hover:scale-105" 
                          />
                        )}

                        <div className="flex-1 overflow-y-auto pr-1 mb-4 [scrollbar-width:thin] [scrollbar-color:var(--color-border)_transparent] relative z-10">
                          <h3 
                            style={customStyle}
                            className={cn(
                              "font-serif text-xl md:text-2xl mb-2 font-medium",
                              isLightText ? "text-white" : "text-primary"
                            )}
                          >
                            {pkg.name}
                          </h3>
                          {pkg.description && (
                            <p 
                              style={isCustomColor ? { color: pkg.textColor!, opacity: 0.8 } : undefined}
                              className={cn(
                                "font-sans text-xs md:text-sm mb-4 font-light leading-relaxed",
                                isLightText ? "text-neutral-300" : "text-secondary"
                              )}
                            >
                              {pkg.description}
                            </p>
                          )}
                          
                          <div 
                            style={isCustomColor ? { color: pkg.textColor!, borderColor: `${pkg.textColor!}33` } : undefined}
                            className={cn(
                              "text-2xl md:text-3xl font-serif mb-4 border-b pb-4 font-medium",
                              isLightText ? "text-white border-neutral-800" : "text-primary border-border/20"
                            )}
                          >
                            {"Rp. " + pkg.price.toLocaleString("id-ID")}
                          </div>

                          <ul className={cn(
                            "space-y-3 font-sans text-xs md:text-sm",
                            isLightText ? "text-neutral-200" : "text-secondary"
                          )}>
                            {pkg.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2.5">
                                <span 
                                  style={isCustomColor ? { backgroundColor: pkg.textColor! } : undefined}
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5",
                                    isLightText ? "bg-white" : "bg-primary"
                                  )} 
                                />
                                <span style={customStyle}>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Button
                          render={<Link href={`/book?package=${encodeURIComponent(pkg.name)}&categoryId=${encodeURIComponent(pkg.categoryId)}`} />}
                          nativeButton={false}
                          size="lg"
                          style={buttonStyle}
                          className={cn(
                            "w-full mt-auto cursor-pointer relative z-10 font-medium h-auto min-h-11 py-2.5 px-4 whitespace-normal text-center leading-snug",
                            !isCustomButtonColor && (
                              isLightText
                                ? "bg-white text-black hover:bg-neutral-200"
                                : "bg-primary text-primary-foreground hover:opacity-90"
                            )
                          )}
                        >
                          <span className="flex flex-col items-center justify-center text-center leading-snug">
                            <span className="text-xs font-normal opacity-90">Pesan Sesi</span>
                            <span className="font-semibold text-xs sm:text-sm">{pkg.name}</span>
                          </span>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
