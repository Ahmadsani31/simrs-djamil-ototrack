import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as Application from 'expo-application';

const ApplicationSchame = Application.applicationId;
// Google OAuth Constants

export const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!;
export const GOOGLE_CLIENT_SECRET = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET!;

export const APPEL_CLIENT_ID = process.env.EXPO_PUBLIC_APPLE_CLIENT_ID!;

// Environment Constants
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://backoffice.rsdjamil.co.id/pencatatan-kendaraan/api';
export const URL_PLAY_STORE = 'https://play.google.com/store/apps/details?id=' + ApplicationSchame;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
