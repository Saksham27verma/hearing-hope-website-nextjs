import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function toTelHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export const BOOKING_TOKEN_PERCENT = 0.1;

export function bookingTokenAmount(price: number) {
  return Math.round(price * BOOKING_TOKEN_PERCENT);
}

export function remainingBalance(price: number) {
  return price - bookingTokenAmount(price);
}
