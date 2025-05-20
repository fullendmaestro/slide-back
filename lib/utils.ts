import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ApplicationError extends Error {
  info: string;
  status: number;
}

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error(
      "An error occurred while fetching the data."
    ) as ApplicationError;

    error.info = await res.json();
    error.status = res.status;

    throw error;
  }

  return res.json();
};

export function getLocalStorage(key: string) {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem(key) || "[]");
  }
  return [];
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function addCommas(number: number | string) {
  if (!["string", "number"].includes(typeof number)) return number;

  const num = `${number}`;
  const [whole, decimal] = num.split(".");
  const digitsSplit = whole.split("");
  let counter = 0;

  // Iterate through the digits from right to left
  for (let i = digitsSplit.length - 1; i >= 0; i--) {
    // Increment the counter
    counter++;

    // If the counter is a multiple of 3 and we're not at the leftmost digit, add a comma
    if (counter % 3 === 0 && i !== 0) {
      digitsSplit.splice(i, 0, ",");
    }
  }

  let digits = digitsSplit.join("");

  if (decimal) {
    digits = `${digits}.${decimal}`;
  }

  return digits;
}

export function formatBytes(bytes: number) {
  if (typeof bytes !== "number") return bytes;

  const limit = 1000;
  let numberFormat = "B";

  if (bytes >= limit * 1000000) {
    numberFormat = "GB";
  } else if (bytes >= limit * 1000) {
    numberFormat = "MB";
  } else if (bytes >= limit) {
    numberFormat = "KB";
  }

  let normalizedBytes = bytes;

  if (numberFormat === "GB") {
    normalizedBytes = bytes / 1000000000;
  } else if (numberFormat === "MB") {
    normalizedBytes = bytes / 1000000;
  } else if (numberFormat === "KB") {
    normalizedBytes = bytes / 1000;
  }

  let amount = "";

  if (normalizedBytes % 1 !== 0) {
    amount = normalizedBytes.toFixed(1);
  } else {
    amount = `${normalizedBytes}`;
  }

  amount = `${addCommas(amount)}`;

  return `${amount} ${numberFormat}`;
}
