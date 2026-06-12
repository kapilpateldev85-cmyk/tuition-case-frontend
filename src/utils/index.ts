import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

/** Merge Tailwind class names safely. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date string as "MMM d, yyyy". */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch {
    return "Invalid date";
  }
}

/** Format a date string as a relative time (e.g. "2 hours ago"). */
export function formatRelativeTime(dateString: string | undefined): string {
  if (!dateString) return "N/A";
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return "Invalid date";
  }
}

/** Format a number as a dollar amount (currency-agnostic). */
export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/** Format a file size in bytes to a human-readable string. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Truncate a string to a maximum length with an ellipsis. */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

/** Get initials from a full name (max 2 chars). */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Sleep for a given number of milliseconds (used in mocks). */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Generate a random ID (for mocks). */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

/** Deep clone an object (for in-memory mock store safety). */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** Check if a file type is an image. */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

/** Check if a file type is a PDF. */
export function isPdfFile(mimeType: string): boolean {
  return mimeType === "application/pdf";
}

/** Build a query string from an object, omitting empty/undefined values. */
export function buildQueryString(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&");
}
