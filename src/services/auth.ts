import axios from 'axios';
import { LoginData } from '@/types/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const restApi = {
  login: async (data: LoginData) => {
    console.log('Login function called with data:', JSON.stringify(data));

    const post = {
      username: data.email,
      password: data.password,
    };

    const response = await axios.post(`${API_URL}/auth/login`, post, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  cekLogin: async (isToken: string) => {
    console.log('isToken ', isToken);
    const response = await axios.get(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${isToken}`,
        },
      });
      return response.data;
  }
};
