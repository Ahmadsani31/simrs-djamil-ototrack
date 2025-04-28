import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/api';
import { LoginData, RegisterData, User } from '@/types/types';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setToken: (token: string) => Promise<void>;
  setUser: (user: User) => void;
  login: (data:LoginData) => Promise<void>;
  register: (data:RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: false,
  error: null,

  setToken: async (token) => {
    await SecureStore.setItemAsync('token', token);
    set({ token });
  },

  setUser: (user) => set({ user }),

  login: async (data:LoginData) => {
    console.log('Login function called with data:', JSON.stringify(data));
    
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authService.login(data);

      console.log('Login successful:', token, user);
      

      await SecureStore.setItemAsync('token', token);
      set({ token, user, isLoading: false });
    } catch (error: any) {
      console.log('auth store error:', error);
      
      set({ 
        error: error.response?.data?.message || 'Login failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  register: async (data:RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authService.register(data);
      await SecureStore.setItemAsync('token', token);
      set({ token, user, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Registration failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    set({ token: null, user: null });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        const user = await authService.getProfile();

        console.log('Check auth successful:', token, user);
        
        set({ token, user, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      await SecureStore.deleteItemAsync('token');
      set({ token: null, user: null, isLoading: false });
    }
  },
}));