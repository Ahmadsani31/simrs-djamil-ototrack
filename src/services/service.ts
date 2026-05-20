import axios, { AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

import { useAuthStore } from '@/stores/authStore';
import { API_URL } from '@/utils/constants';
import { logger } from '@/utils/logger';

// Inisialisasi instance axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor (untuk inject token JWT)
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Cek error token expired
    if (error.response?.status === 401) {
      logger.log('Token expired, logging out...');
      const { logout } = useAuthStore.getState();
      logout();
    }
    return Promise.reject(error);
  }
);

// Method umum. Default generic `any` agar backward-compatible dengan caller
// existing yang men-destructure `response.data` dari envelope `{ data, message }`.
// Untuk kode baru, pass `<ResponseType>` agar mendapat typing penuh.
const secureApi = {
  get: async <TResponse = any>(
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<TResponse> => {
    const response = await api.get<TResponse>(url, config);
    return response.data;
  },

  post: async <TResponse = any, TData = unknown>(
    url: string,
    data: TData,
    config: AxiosRequestConfig = {}
  ): Promise<TResponse> => {
    const response = await api.post<TResponse>(url, data, config);
    return response.data;
  },

  put: async <TResponse = any, TData = unknown>(
    url: string,
    data: TData,
    config: AxiosRequestConfig = {}
  ): Promise<TResponse> => {
    const response = await api.put<TResponse>(url, data, config);
    return response.data;
  },

  del: async <TResponse = any>(
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<TResponse> => {
    const response = await api.delete<TResponse>(url, config);
    return response.data;
  },

  // Khusus untuk form-data (upload file, blob, dsb)
  postForm: async <TResponse = any>(url: string, formData: FormData): Promise<TResponse> => {
    const response = await api.post<TResponse>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Khusus untuk x-www-form-urlencoded
  postFormUrlEncoded: async <TResponse = any>(
    url: string,
    data: Record<string, string | number | boolean>
  ): Promise<TResponse> => {
    const params = new URLSearchParams();
    for (const key in data) {
      params.append(key, String(data[key]));
    }
    const response = await api.post<TResponse>(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
};

export default secureApi;
