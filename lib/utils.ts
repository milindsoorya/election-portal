import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString("en-IN");
}

export function formatVotes(n: number): string {
  return n.toLocaleString("en-IN");
}

export function getTimeUntil(targetDate: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
} {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isPast: false };
}

export function getAllianceColor(alliance: string): string {
  switch (alliance) {
    case "LDF": return "#e63946";
    case "UDF": return "#0077b6";
    case "NDA": return "#f77f00";
    default: return "#6c757d";
  }
}

export function getAllianceBg(alliance: string): string {
  switch (alliance) {
    case "LDF": return "bg-red-50 text-red-700 border-red-200";
    case "UDF": return "bg-blue-50 text-blue-700 border-blue-200";
    case "NDA": return "bg-orange-50 text-orange-700 border-orange-200";
    default: return "bg-gray-50 text-gray-700 border-gray-200";
  }
}
