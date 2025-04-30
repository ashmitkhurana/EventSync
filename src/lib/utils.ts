import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

/**
 * Combine multiple class names with tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to a human-readable format
 */
export function formatDate(date: string | Date, formatString: string = 'MMM dd, yyyy') {
  return format(new Date(date), formatString);
}

/**
 * Format a date with time
 */
export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'MMM dd, yyyy h:mm a');
}

/**
 * Truncate text to a specified length
 */
export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Generate a random avatar URL based on a username or email
 */
export function getAvatarUrl(identifier: string) {
  const hash = Array.from(identifier)
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) & 0xffffffff, 0)
    .toString(16);
  
  return `https://avatars.dicebear.com/api/identicon/${hash}.svg`;
}

/**
 * Combine a list of event categories into a readable string
 */
export function formatCategories(categories: string[]) {
  if (categories.length === 0) return '';
  if (categories.length === 1) return categories[0];
  
  const last = categories.pop();
  return `${categories.join(', ')} and ${last}`;
}