import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { restApi } from '@/services/auth';
import { LoginData, LoginSSOData, User } from '@/types/types';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  errorLogin: string | null;
  login: (data: LoginData) => Promise<User | false>;
  loginSSO: (data: LoginSSOData) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const resolveLoginError = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data) {
      const message = (error.response.data as { message?: string }).message;
      return message ?? fallback;
    }
    if (error.request) {
      return 'Tidak bisa terhubung ke server. Cek koneksi kamu.';
    }
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: false,
  errorLogin: null,

  login: async (data: LoginData) => {
    set({ isLoading: true, errorLogin: null });

    try {
      const response = await restApi.login(data);
      const token = response.data.token;
      const user = response.data.user;

      await SecureStore.setItemAsync('token', token);
      set({ token, user, isLoading: false });
      return user;
    } catch (error: unknown) {
      set({
        errorLogin: resolveLoginError(error, 'Username atau password salah'),
        isLoading: false,
      });
      return false;
    }
  },

  loginSSO: async (data: LoginSSOData) => {
    set({ isLoading: true, errorLogin: null });

    try {
      const response = await restApi.loginSSO(data);
      const token = response.data.token;
      const user = response.data.user;

      await SecureStore.setItemAsync('token', token);
      set({ token, user, isLoading: false });
      return true;
    } catch (error: unknown) {
      set({
        errorLogin: resolveLoginError(error, 'Email tidak terdaftar'),
        isLoading: false,
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    const token = await SecureStore.getItemAsync('token');
    if (token) {
      // Best-effort: kalau server error / offline, tetap lanjut bersihkan token lokal.
      try {
        await restApi.logout(token);
      } catch {
        // ignore
      }
    }
    await SecureStore.deleteItemAsync('token');
    set({ token: null, user: null, isLoading: false });
    router.replace('/login');
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        const response = await restApi.cekLogin(token);
        const user = response.data.user;
        set({ token, user, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      await SecureStore.deleteItemAsync('token');
      set({ token: null, user: null, isLoading: false });
    }
  },
}));
