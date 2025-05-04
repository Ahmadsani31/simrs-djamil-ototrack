import { useAuthStore } from '@/stores/authStore';
import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
// Ganti dengan base URL API kamu
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Inisialisasi instance axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Request interceptor (untuk inject token JWT)
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');
    // console.log('token api interceptors ', token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Global Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || '';
    // Cek error token expired
    if (error.response?.status === 401 && message.toLowerCase().includes('expired token')) {
      console.log('Token expired, logging out...');
      SecureStore.deleteItemAsync('token');
      secureApi.prosesLogout();
    }

    // console.log('error api interceptors ', error);
    // console.log('error api interceptors message ', message);

    // Lanjutkan error
    return Promise.reject(error);
  }
);

// ✅ Method umum
const secureApi = {
  get: async (url: string, config = {}) => {
    const response = await api.get(url, config);
    return response.data;
  },

  post: async (url: string, data: any, config = {}) => {
    const response = await api.post(url, data, config);
    return response.data;
  },

  put: async (url: string, data: any, config = {}) => {
    const response = await api.put(url, data, config);
    return response.data;
  },

  del: async (url: string, config = {}) => {
    const response = await api.delete(url, config);
    return response.data;
  },

  // ✅ Khusus untuk form-data (upload file, blob, dsb)
  postForm: async (url: string, formData: FormData) => {
    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // ✅ Khusus untuk x-www-form-urlencoded
  postFormUrlEncoded: async (url: string, data: Record<string, any>) => {
    const params = new URLSearchParams();
    for (const key in data) {
      params.append(key, data[key]);
    }
    const response = await api.post(url, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
  prosesLogout: async () =>{
    const { logout } = useAuthStore();
    logout();
  }
};

export default secureApi;
