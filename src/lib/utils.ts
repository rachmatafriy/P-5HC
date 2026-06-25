import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, locale = "en-GB"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
}

export function startOfWeek(date = new Date()): Date {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function riskColor(level: string): string {
  switch (level) {
    case "low":
      return "text-emerald-500";
    case "moderate":
      return "text-amber-500";
    case "high":
      return "text-orange-500";
    case "very-high":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
}
