// Add a global BigInt serialization fix
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// Extend the BigInt type to include the toJSON method
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
