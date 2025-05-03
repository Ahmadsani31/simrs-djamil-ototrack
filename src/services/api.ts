import { LoginData, RegisterData } from '@/types/types';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

console.log('URL API = ',API_URL);

// const API_URL = process.env.EXPO_PUBLIC_API_URL // Replace with your API URL

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized error
      SecureStore.deleteItemAsync('token');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (data: LoginData) => {
    console.log('Login function called with data:', JSON.stringify(data));
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/user');
    return response.data;
  },
};

export const todoService = {
  getTodos: async () => {
    const response = await api.get('/todos');
    return response.data;
  },
  // Add other todo-related methods here
};

export const tracking = {
  live_get: async (data: any) => {
    const response = await api.post('/live-tracking', data);
    return response.data;
  },
  // Add other todo-related methods here
};

export default api;
