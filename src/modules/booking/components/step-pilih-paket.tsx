"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";
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
  sessionDuration: number | null;
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

interface StepPilihPaketProps {
  initialPackages: PackageItem[];
  categories: CategoryItem[];
  selectedPackageName: string;
  selectedCategoryId: string;
  onSelectPackage: (packageName: string) => void;
  onCategoryChange?: (categoryId: string, bookingType: string, sessionDuration: number | null) => void;
  onNext: () => void;
}

export function StepPilihPaket({
  initialPackages,
  categories,
  selectedPackageName,
  selectedCategoryId,
  onSelectPackage,
  onCategoryChange,
  onNext,
}: StepPilihPaketProps) {
  // Find category of currently selected package (if any)
  const currentSelectedPkg = initialPackages.find(
    (p) => p.name === selectedPackageName && (!selectedCategoryId || p.categoryId === selectedCategoryId)
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    selectedCategoryId || (currentSelectedPkg ? currentSelectedPkg.categoryId : null)
  );

  // Sync selectedCategory state when selectedCategoryId or selectedPackageName prop updates (e.g. pre-filled from query param after mount)
  useEffect(() => {
    if (selectedCategoryId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCategory(selectedCategoryId);
    } else if (selectedPackageName) {
      const pkg = initialPackages.find(
        (p) => p.name === selectedPackageName && (!selectedCategoryId || p.categoryId === selectedCategoryId)
      );
      if (pkg && pkg.categoryId !== selectedCategory) {
        setSelectedCategory(pkg.categoryId);
      }
    }
  }, [selectedCategoryId, selectedPackageName, initialPackages, selectedCategory]);

  const activePackages = selectedCategory
    ? initialPackages.filter((pkg) => pkg.categoryId === selectedCategory)
    : [];

  // Notify parent on load or when selection is updated
  useEffect(() => {
    if (selectedPackageName && selectedCategory) {
      const pkg = initialPackages.find(
        (p) => p.name === selectedPackageName && p.categoryId === selectedCategory
      );
      if (pkg) {
        const cat = categories.find((c) => c.id === pkg.categoryId);
        if (onCategoryChange) {
          onCategoryChange(pkg.categoryId, cat?.bookingType || "DATE_ONLY", pkg.sessionDuration || null);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPackageName, selectedCategory, initialPackages, categories]);

  const handleSelectPackageLocal = (pkg: PackageItem) => {
    onSelectPackage(pkg.name);
    const cat = categories.find((c) => c.id === pkg.categoryId);
    if (onCategoryChange) {
      onCategoryChange(pkg.categoryId, cat?.bookingType || "DATE_ONLY", pkg.sessionDuration || null);
    }
  };

  return (
    <div className="space-y-10">
      <div className="text-center max-w-md mx-auto">
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-secondary mb-2 block font-bold">
          Langkah 1 dari 5
        </span>
        <h2 className="font-serif text-2xl md:text-3xl text-primary mb-2 font-medium">Pilih Paket Layanan</h2>
        <p className="font-sans text-xs text-secondary font-light leading-relaxed">
          Silakan pilih kategori acara terlebih dahulu, lalu pilih paket layanan yang paling sesuai dengan kebutuhan Anda.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                onSelectPackage("");
                if (onCategoryChange) {
                  onCategoryChange(cat.id, cat.bookingType || "DATE_ONLY", null);
                }
              }}
              className={cn(
                "p-3.5 sm:p-5 text-left border transition-all duration-300 group cursor-pointer flex flex-col justify-between h-[135px] sm:h-[150px] rounded-none",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/40 bg-card hover:border-primary/60 text-foreground"
              )}
            >
              <div>
                <h3 className="font-serif text-xs sm:text-base font-medium leading-tight mb-2 flex items-center gap-1 sm:gap-1.5 flex-wrap">
                  {cat.label}
                  {cat.bookingType === "TIME_BASED" && (
                    <span className={cn(
                      "font-sans text-[7px] sm:text-[8px] uppercase tracking-wider px-1 sm:px-1.5 py-0.5 font-bold border",
                      isSelected 
                        ? "bg-primary-foreground text-primary border-primary-foreground" 
                        : "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900/30"
                    )}>
                      Multi-Sesi
                    </span>
                  )}
                </h3>
                {cat.description && (
                  <p className={cn(
                    "font-sans text-[10px] sm:text-[11px] font-light leading-relaxed line-clamp-2 sm:line-clamp-3",
                    isSelected ? "text-primary-foreground/90" : "text-secondary"
                  )}>
                    {cat.description}
                  </p>
                )}
              </div>
              
              <div className="flex justify-end w-full">
                <span className={cn(
                  "font-sans text-[8px] sm:text-[9px] uppercase tracking-wider font-bold transition-all duration-300 group-hover:translate-x-1",
                  isSelected ? "text-primary-foreground" : "text-primary"
                )}>
                  {isSelected ? "Terpilih ✓" : "Pilih Kategori →"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Package Selection */}
      <div className="min-h-[200px]">
        {!selectedCategory ? (
          <div className="border border-dashed border-border/60 p-8 text-center flex flex-col items-center justify-center bg-muted/10">
            <Sparkles className="w-8 h-8 text-secondary mb-3 stroke-1 animate-pulse" />
            <h4 className="font-serif text-lg text-primary mb-1 font-medium">Jelajahi Paket</h4>
            <p className="font-sans text-xs text-secondary font-light max-w-xs leading-relaxed">
              Pilih salah satu kategori acara di atas untuk melihat tarif dan rincian paket kami.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border-b border-border/20 pb-2">
              <h3 className="font-serif text-xl text-primary font-medium">
                Pilihan Paket {categories.find(c => c.id === selectedCategory)?.label || "Kategori"}
              </h3>
            </div>

            {activePackages.length === 0 ? (
              <div className="text-center py-8 border border-border/30 text-secondary font-sans text-xs">
                Tidak ada paket aktif ditemukan dalam kategori ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activePackages.map((pkg) => {
                  const isSelected = selectedPackageName === pkg.name;
                  const hasBg = !!pkg.imageUrl;
                  const isCustomColor = pkg.textColor && pkg.textColor.startsWith("#");
                  const activeCategory = categories.find((c) => c.id === selectedCategory);
                  const isWedding = activeCategory?.name.toLowerCase() === "wedding";

                  // Text styling logic
                  const isLightText = isCustomColor 
                    ? isHexColorLight(pkg.textColor)
                    : (pkg.textColor === "LIGHT" || 
                       (pkg.textColor === "DEFAULT" && isWedding) ||
                       (!pkg.textColor && isWedding) ||
                       (hasBg && pkg.textColor !== "DARK"));

                  const customStyle = isCustomColor ? { color: pkg.textColor! } : undefined;

                  const isCustomButtonColor = pkg.buttonColor && pkg.buttonColor.startsWith("#");
                  const buttonStyle = isCustomButtonColor 
                    ? (isSelected 
                        ? { 
                            backgroundColor: pkg.buttonColor!, 
                            color: isHexColorLight(pkg.buttonColor) ? "#000000" : "#ffffff",
                            border: "1px solid",
                            borderColor: pkg.buttonColor!
                          }
                        : {
                            backgroundColor: "transparent",
                            color: pkg.buttonColor!,
                            border: "1px solid",
                            borderColor: pkg.buttonColor!
                          }
                      )
                    : undefined;

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => handleSelectPackageLocal(pkg)}
                      className={cn(
                        "border p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[350px] rounded-none relative overflow-hidden",
                        isSelected
                          ? "border-primary ring-1 ring-primary"
                          : "border-border/40 hover:border-primary/60",
                        hasBg 
                          ? "bg-neutral-900 border-neutral-800" 
                          : isWedding
                            ? "bg-neutral-950 border-neutral-800 text-neutral-100"
                            : "bg-card text-foreground"
                      )}
                    >
                      {/* Background Image */}
                      {hasBg && (
                        <img 
                          src={pkg.imageUrl!} 
                          alt="" 
                          className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 hover:scale-105" 
                        />
                      )}

                      {isSelected && (
                        <div className="absolute top-4 right-4 bg-primary text-primary-foreground p-1 rounded-none z-20">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                      
                      <div className="flex-1 overflow-y-auto pr-1 mb-4 [scrollbar-width:thin] [scrollbar-color:var(--color-border)_transparent] relative z-10">
                        <h4 
                          style={customStyle}
                          className={cn(
                            "font-serif text-xl mb-2 font-medium flex items-center gap-2 flex-wrap",
                            isLightText ? "text-white" : "text-primary"
                          )}
                        >
                          {pkg.name}
                          {pkg.sessionDuration && (
                            <span className={cn(
                              "font-sans text-[8px] uppercase tracking-wider px-2 py-0.5 font-bold border",
                              isLightText
                                ? "bg-black/30 text-white border-white/20"
                                : "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/30"
                            )}>
                              {pkg.sessionDuration} Menit
                            </span>
                          )}
                        </h4>
                        {pkg.description && (
                          <p 
                            style={isCustomColor ? { color: pkg.textColor!, opacity: 0.8 } : undefined}
                            className={cn(
                              "font-sans text-xs mb-4 font-light leading-relaxed",
                              isLightText ? "text-neutral-300" : "text-secondary"
                            )}
                          >
                            {pkg.description}
                          </p>
                        )}
                        
                        <div 
                          style={isCustomColor ? { color: pkg.textColor!, borderColor: `${pkg.textColor!}33` } : undefined}
                          className={cn(
                            "text-2xl font-serif mb-5 border-b pb-4 font-medium",
                            isLightText ? "text-white border-neutral-800" : "text-primary border-border/20"
                          )}
                        >
                          {"Rp. " + pkg.price.toLocaleString("id-ID")}
                        </div>

                        <ul className={cn(
                          "space-y-2.5 font-sans text-[11px] mb-6",
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
                        type="button"
                        style={buttonStyle}
                        className={cn(
                          "w-full font-sans text-[10px] uppercase tracking-widest py-4 rounded-none mt-auto cursor-pointer relative z-10",
                          !isCustomButtonColor && (
                            isSelected
                              ? "bg-primary text-white"
                              : isLightText
                                ? "bg-white text-black hover:bg-neutral-200"
                                : "bg-transparent text-primary border border-border/40 hover:bg-muted"
                          )
                        )}
                      >
                        {isSelected ? "Paket Terpilih ✓" : "Pilih Paket Ini"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Next navigation action */}
      {selectedPackageName && (
        <div className="flex justify-end pt-4 border-t border-border/20">
          <Button
            type="button"
            onClick={onNext}
            className="font-sans text-xs uppercase tracking-widest py-5 px-10 rounded-none font-bold text-white transition-all hover:opacity-90 cursor-pointer"
          >
            Lanjut ke Tanggal & Waktu →
          </Button>
        </div>
      )}
    </div>
  );
}
