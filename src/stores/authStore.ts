import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { LoginData, RegisterData, User } from '@/types/types';
import { Alert } from 'react-native';
import { restApi } from '@/services/auth';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  errorLogin: string | null;
  errorRegister: string | null;
  setToken: (token: string) => Promise<void>;
  setUser: (user: User) => void;
  login: (data: LoginData) => Promise<boolean>;
  // register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: false,
  error: null,
  errorLogin: null,
  errorRegister: null,

  setToken: async (token) => {
    await SecureStore.setItemAsync('token', token);
    set({ token });
  },

  setUser: (user) => set({ user }),

  login: async (data: LoginData) => {
    console.log('Login function called with data:', JSON.stringify(data));

    set({ isLoading: true, errorLogin: null });

    try {
      const response = await restApi.login(data);
      const token = response.data.token;
      const user = response.data.user;

      console.log('Login successful:', token, user);

      await SecureStore.setItemAsync('token', token);
      set({ token, user, isLoading: false });
      return true;
    } catch (error: any) {
      Alert.alert('Error', error.message as string);
      console.log('Login error:', JSON.stringify(error.message));
      set({
        errorLogin: error.response?.data?.message || 'Login failed',
        isLoading: false,
      });
      return false;
    }
  },

  // register: async (data: RegisterData) => {
  //   console.log('Register function called with data:', JSON.stringify(data));
  //   set({ isLoading: true, errorRegister: null });
  //   try {
  //     const response = await authService.register(data);
  //     const token = response.data.token;
  //     const user = response.data.user;
  //     await SecureStore.setItemAsync('token', token);
  //     set({ token, user, isLoading: false });
  //   } catch (error: any) {
  //     Alert.alert('Error', error.message as string);
  //     console.log('Register error:', JSON.stringify(error));
  //     set({
  //       errorRegister: error.response?.data?.message || 'Registration failed',
  //       isLoading: false,
  //     });
  //     throw error;
  //   }
  // },

  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    set({ token: null, user: null });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await SecureStore.getItemAsync('token');
      console.log('Check auth token:', token);
      if (token) {
        const response = await restApi.cekLogin(token);
        const user = response.data.user;
        console.log('Check auth successful:', token, user);

        set({ token, user, isLoading: false });
      } else {
        console.log('token not found');
        set({ isLoading: false });
      }
    } catch (error:any) {
      console.log('Check User error:', JSON.stringify(error.response?.data?.message));
      await SecureStore.deleteItemAsync('token');
      set({ token: null, user: null, isLoading: false });
    }
  },
}));
