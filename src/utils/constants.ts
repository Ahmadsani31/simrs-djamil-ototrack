import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as Application from 'expo-application';

const ApplicationSchame = Application.applicationId;
// Google OAuth Constants

export const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!;
export const GOOGLE_CLIENT_SECRET = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET!;
export const GOOGLE_REDIRECT_URI = `${process.env.EXPO_PUBLIC_BASE_URL}/api/auth/callback`;
export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

export const APPEL_CLIENT_ID = process.env.EXPO_PUBLIC_APPLE_CLIENT_ID!;

// Environment Constants
export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
export const APP_SCHEME = process.env.EXPO_PUBLIC_SCHEME;
export const API_URL = process.env.EXPO_PUBLIC_API_URL;
export const URL_PLAY_STORE = 'https://play.google.com/store/apps/details?id=' + ApplicationSchame;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
