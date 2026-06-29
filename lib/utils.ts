import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateBookingCode(categoryCode?: string, packageCode?: string): string {
  const cat = (categoryCode || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const pkg = (packageCode || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const prefix = (cat + pkg) || "SK";
  const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
  return `${prefix}-${randomDigits}`;
}
