import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

/**
 * Returns the app's base URL safe for OAuth redirects.
 * Replaces 0.0.0.0 with localhost — browsers can't navigate to 0.0.0.0.
 */
export function getAppOrigin(): string {
  if (typeof window === "undefined") return "";
  return window.location.origin.replace("0.0.0.0", "localhost");
}
