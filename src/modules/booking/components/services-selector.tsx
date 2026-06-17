"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryItem {
  id: string;
  name: string;
  label: string;
  description: string | null;
}

interface PackageItem {
  id: string;
  name: string;
  categoryId: string;
  category?: CategoryItem | null;
  price: number;
  features: string[];
  description: string | null;
}

interface ServicesSelectorProps {
  initialPackages: PackageItem[];
  categories: CategoryItem[];
}

export function ServicesSelector({ initialPackages, categories }: ServicesSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);


  const activePackages = selectedCategory
    ? initialPackages.filter((pkg) => pkg.categoryId === selectedCategory)
    : [];



  return (
    <div className="w-full space-y-16">
      {/* Category Grid Selection */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "p-6 text-left border transition-all duration-300 group cursor-pointer flex flex-col justify-between h-[180px] rounded-none",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/40 bg-card hover:border-primary/60 text-foreground"
              )}
            >
              <div>
                <span className={cn(
                  "font-sans text-[10px] uppercase tracking-widest font-bold block mb-3",
                  isSelected ? "text-primary-foreground/75" : "text-secondary"
                )}>
                  Kategori
                </span>
                <h3 className="font-serif text-lg md:text-xl font-medium leading-tight mb-2">
                  {cat.label}
                </h3>
                {cat.description && (
                  <p className={cn(
                    "font-sans text-xs font-light leading-relaxed line-clamp-3",
                    isSelected ? "text-primary-foreground/90" : "text-secondary"
                  )}>
                    {cat.description}
                  </p>
                )}
              </div>
              
              <div className="flex justify-end w-full">
                <span className={cn(
                  "font-sans text-[10px] uppercase tracking-wider font-bold transition-all duration-300 group-hover:translate-x-1",
                  isSelected ? "text-primary-foreground" : "text-primary"
                )}>
                  {isSelected ? "Terpilih" : "Pilih Acara →"}
                </span>
              </div>
            </button>
          );
        })}
      </section>

      {/* Dynamic Inquiries Block */}
      <section className="transition-all duration-500 ease-in-out min-h-[300px]">
        {!selectedCategory ? (
          /* Placeholder */
          <div className="border border-dashed border-border/60 p-12 text-center flex flex-col items-center justify-center min-h-[300px] bg-muted/20">
            <Sparkles className="w-10 h-10 text-secondary mb-4 stroke-1 animate-pulse" />
            <h4 className="font-serif text-xl text-primary mb-2 font-medium">Jelajahi Paket</h4>
            <p className="font-sans text-sm text-secondary font-light max-w-sm leading-relaxed">
              Pilih salah satu kategori acara di atas untuk melihat tarif, hasil pengerjaan, dan fitur paket kami.
            </p>
          </div>
        ) : (
          /* Pricelist Details */
          <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
            <div className="border-b border-border/20 pb-4">
              <span className="font-sans text-[10px] uppercase tracking-widest text-secondary font-bold">
                Layanan Tersedia
              </span>
              <h2 className="font-serif text-2xl md:text-3xl text-primary font-medium mt-1">
                Tingkat Harga {categories.find(c => c.id === selectedCategory)?.label || "Kategori"}
              </h2>
            </div>

            {activePackages.length === 0 ? (
              <div className="text-center py-12 border border-border/30 text-secondary font-sans text-xs">
                Tidak ada paket aktif ditemukan dalam kategori ini.
              </div>
            ) : (
              <div className={cn(
                "grid gap-8 items-start",
                activePackages.length === 1 ? "grid-cols-1 max-w-3xl mx-auto" : "grid-cols-1 lg:grid-cols-2"
              )}>
                {activePackages.map((pkg) => {
                  return (
                    <div
                      key={pkg.id}
                      className="bg-card border border-border/40 p-8 md:p-10 hover:-translate-y-1 transition-all duration-300 shadow-sm relative flex flex-col justify-between min-h-[450px]"
                    >
                      <div>
                        <h3 className="font-serif text-2xl md:text-3xl text-primary mb-3 font-medium">
                          {pkg.name}
                        </h3>
                        {pkg.description && (
                          <p className="font-sans text-sm text-secondary mb-6 font-light leading-relaxed">
                            {pkg.description}
                          </p>
                        )}
                        
                        <div className="text-3xl font-serif text-primary mb-8 border-b border-border/20 pb-6 font-medium">
                          {"Rp. " + pkg.price.toLocaleString("id-ID")}
                        </div>

                        <ul className="space-y-4 font-sans text-sm text-secondary mb-8">
                          {pkg.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        render={<Link href={`/book?package=${encodeURIComponent(pkg.name)}`} />}
                        nativeButton={false}
                        className="w-full font-sans text-xs uppercase tracking-widest py-6 rounded-none mt-auto cursor-pointer"
                      >
                        Pesan Sesi {pkg.name}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
