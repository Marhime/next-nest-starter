import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the full URL for a photo, handling both relative and absolute URLs
 */
export function getPhotoUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  return `${API_URL}${url}`;
}

export const formattedMXNPrice = (price: number) => {
  if (!price) return;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(Number(price));
};
