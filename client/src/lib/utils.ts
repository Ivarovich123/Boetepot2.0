import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return '€' + parseFloat(value.toString()).toFixed(2);
}

export function formatDate(dateStr: string | Date): string {
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return new Intl.DateTimeFormat('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch (e) {
    return String(dateStr);
  }
}
