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
    
    // Get day as number (without leading zero)
    const day = date.getDate();
    
    // Get month name in Dutch
    const monthNames = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 
                      'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
    const month = monthNames[date.getMonth()];
    
    // Return formatted date like "6 Maart"
    return `${day} ${month}`;
  } catch (e) {
    return String(dateStr);
  }
}
