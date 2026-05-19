import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { LoginData, LoginSSOData, User } from '@/types/types';
import { restApi } from '@/services/auth';
import { router } from 'expo-router';

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

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: false,
  errorLogin: null,

  login: async (data: LoginData) => {
    // console.log('Login function called with data:', JSON.stringify(data));

    set({ isLoading: true, errorLogin: null });

    try {
      const response = await restApi.login(data);
      const token = response.data.token;
      const user = response.data.user;

      // console.log('Login successful :', user);
      // console.log('Token :', token);

      await SecureStore.setItemAsync('token', token);
      set({ token, user, isLoading: false });
      return user;
    } catch (error: any) {
      // Alert.alert('Warning!', error.message as string);
      // console.log('Login error:', error.message as string);
      if (error.response && error.response.data) {
        const msg = error.response.data.message || 'Username atau password salah';
        set({
          errorLogin: msg,
          isLoading: false,
        });
      } else if (error.request) {
        set({
          errorLogin: 'Tidak bisa terhubung ke server. Cek koneksi kamu.',
          isLoading: false,
        });
      } else {
        set({
          errorLogin: error.message,
          isLoading: false,
        });
      }
      return false;
    }
  },
  loginSSO: async (data: LoginSSOData) => {
    // console.log('Login function called with data:', JSON.stringify(data));

    set({ isLoading: true, errorLogin: null });

    try {
      const response = await restApi.loginSSO(data);
      const token = response.data.token;
      const user = response.data.user;

      await SecureStore.setItemAsync('token', token);
      set({ token, user, isLoading: false });
      return true;
    } catch (error: any) {
      // Alert.alert('Warning!', error.message as string);
      // console.log('Login error:', error.message as string);
      if (error.response && error.response.data) {
        const msg = error.response.data.message || 'Email tidak terdaftar';
        set({
          errorLogin: msg,
          isLoading: false,
        });
      } else if (error.request) {
        set({
          errorLogin: 'Tidak bisa terhubung ke server. Cek koneksi kamu.',
          isLoading: false,
        });
      } else {
        set({
          errorLogin: error.message,
          isLoading: false,
        });
      }
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
      // console.log('Check auth token:', token);
      if (token) {
        const response = await restApi.cekLogin(token);
        const user = response.data.user;
        // console.log('Check auth successful:', token, user);

        set({ token, user, isLoading: false });
      } else {
        // console.log('token not found');
        set({ isLoading: false });
      }
    } catch (error: any) {
      // console.log('Check User error:', JSON.stringify(error.response?.data?.message));
      await SecureStore.deleteItemAsync('token');
      set({ token: null, user: null, isLoading: false });
    }
  },
}));
