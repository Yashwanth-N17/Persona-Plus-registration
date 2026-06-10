import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const EVENT_DATE = new Date("2026-06-12T17:30:00+05:30");

export function getEventDateText() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDay = new Date(EVENT_DATE.getFullYear(), EVENT_DATE.getMonth(), EVENT_DATE.getDate());
  
  const diffTime = eventDay.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  
  return eventDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function normalizeUsn(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string) {
  return value.trim().replace(/[^\d+]/g, "");
}

export function formatDateTime(value?: string | null) {
  if (!value) return "Not checked in";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
