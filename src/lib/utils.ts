import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export function generateRandomPassword(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  const mix = chars + nums + '!@#$%^&*';

  let pass = '';
  // Ensure at least one letter and one number
  pass += chars[Math.floor(Math.random() * chars.length)];
  pass += nums[Math.floor(Math.random() * nums.length)];

  for (let i = 0; i < 10; i++) {
    pass += mix[Math.floor(Math.random() * mix.length)];
  }

  // Shuffle the string
  return pass.split('').sort(() => 0.5 - Math.random()).join('');
}

export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};
