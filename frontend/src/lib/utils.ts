import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatImageSrc(img: string | null | undefined, fallback: string = "/placeholder-image.jpg"): string {
  if (!img) return fallback;
  if (typeof img !== "string") return fallback;
  const trimmed = img.trim();
  if (!trimmed) return fallback;
  if (
    trimmed.startsWith("http://") || 
    trimmed.startsWith("https://") || 
    trimmed.startsWith("/") || 
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }
  return `data:image/jpeg;base64,${trimmed}`;
}
