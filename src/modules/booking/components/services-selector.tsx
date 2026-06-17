"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Check, Clock, Users, BookOpen, Image as ImageIcon, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PackageItem {
  id: string;
  name: string;
  category: string;
  price: number;
  priceUnit: string | null;
  features: string[];
  description: string | null;
}

interface ServicesSelectorProps {
  initialPackages: PackageItem[];
}

export function ServicesSelector({ initialPackages }: ServicesSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { key: "Wedding", label: "Wedding Documentation", desc: "For weddings, intimate elopements, and vows." },
    { key: "Portraits", label: "Artistic Portraiture", desc: "Studio or outdoor portrait sessions for individuals & couples." },
    { key: "Graduation", label: "Milestone Graduation", desc: "Celebrate and memorialize your academic achievement." },
    { key: "Events", label: "Event Documentation", desc: "Corporate galas, luxury dinners, and brand events." }
  ];

  const activePackages = selectedCategory
    ? initialPackages.filter((pkg) => pkg.category.toLowerCase() === selectedCategory.toLowerCase())
    : [];

  // Icon mapper for inclusions (aesthetic touch)
  const renderIcon = (index: number) => {
    const icons = [
      <Clock key="clock" className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />,
      <Users key="users" className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />,
      <ImageIcon key="image" className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />,
      <BookOpen key="book" className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />,
      <MapPin key="map" className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
    ];
    return icons[index % icons.length] || <Check key="check" className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />;
  };

  return (
    <div className="w-full space-y-16">
      {/* Category Grid Selection */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
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
                  Category
                </span>
                <h3 className="font-serif text-lg md:text-xl font-medium leading-tight mb-2">
                  {cat.key}
                </h3>
                <p className={cn(
                  "font-sans text-xs font-light leading-relaxed",
                  isSelected ? "text-primary-foreground/90" : "text-secondary"
                )}>
                  {cat.desc}
                </p>
              </div>
              
              <div className="flex justify-end w-full">
                <span className={cn(
                  "font-sans text-[10px] uppercase tracking-wider font-bold transition-all duration-300 group-hover:translate-x-1",
                  isSelected ? "text-primary-foreground" : "text-primary"
                )}>
                  {isSelected ? "Selected" : "Select Event →"}
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
            <h4 className="font-serif text-xl text-primary mb-2 font-medium">Explore Packages</h4>
            <p className="font-sans text-sm text-secondary font-light max-w-sm leading-relaxed">
              Select one of the event categories above to view our rates, deliverables, and features.
            </p>
          </div>
        ) : (
          /* Pricelist Details */
          <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
            <div className="border-b border-border/20 pb-4">
              <span className="font-sans text-[10px] uppercase tracking-widest text-secondary font-bold">
                Available Inquiries
              </span>
              <h2 className="font-serif text-2xl md:text-3xl text-primary font-medium mt-1">
                {selectedCategory} Pricing Tiers
              </h2>
            </div>

            {activePackages.length === 0 ? (
              <div className="text-center py-12 border border-border/30 text-secondary font-sans text-xs">
                No active packages found in this category.
              </div>
            ) : (
              <div className={cn(
                "grid gap-8 items-start",
                activePackages.length === 1 ? "grid-cols-1 max-w-3xl mx-auto" : "grid-cols-1 lg:grid-cols-2"
              )}>
                {activePackages.map((pkg) => {
                  const hasStartsAt = pkg.priceUnit === "starts at";
                  const unitText = pkg.priceUnit && !hasStartsAt ? pkg.priceUnit : "";
                  return (
                    <div
                      key={pkg.id}
                      className="bg-card border border-border/40 p-8 md:p-10 hover:-translate-y-1 transition-all duration-300 shadow-sm relative flex flex-col justify-between min-h-[450px]"
                    >
                      <div>
                        {hasStartsAt && (
                          <span className="font-sans text-[10px] uppercase tracking-widest text-primary border border-primary px-3 py-1 font-bold mb-6 inline-block">
                            {pkg.priceUnit}
                          </span>
                        )}
                        <h3 className="font-serif text-2xl md:text-3xl text-primary mb-3 font-medium">
                          {pkg.name}
                        </h3>
                        {pkg.description && (
                          <p className="font-sans text-sm text-secondary mb-6 font-light leading-relaxed">
                            {pkg.description}
                          </p>
                        )}
                        
                        <div className="text-3xl font-serif text-primary mb-8 border-b border-border/20 pb-6 font-medium">
                          ${pkg.price.toLocaleString()}{unitText}
                        </div>

                        <ul className="space-y-4 font-sans text-sm text-secondary mb-8">
                          {pkg.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              {renderIcon(idx)}
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
                        Book {pkg.name}
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
