import axios from 'axios';
import { LoginData } from '@/types/types';
import * as Device from 'expo-device';
import * as Network from 'expo-network';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const restApi = {
  login: async (data: LoginData) => {
    const manufacturer = Device.manufacturer;
    const modelName = Device.modelName;
    const osVersion = Device.osVersion;
    const platformApiLevel = Device.platformApiLevel;
    const rooted = await Device.isRootedExperimentalAsync();
    const ipAddress = await Network.getIpAddressAsync();
    let jenisDevice;
    if (Device.isDevice) {
      jenisDevice = 'Phone';
    }else{
      jenisDevice = 'Emulator';
    }

    console.log('Login function called with data:', JSON.stringify(data));

    const post = {
      username: data.email,
      password: data.password,
      manufacturer,
      modelName,
      osVersion,
      platformApiLevel,
      rooted,
      ipAddress,
      jenisDevice:jenisDevice,
    };

    console.log('data post',post);
    

    const response = await api.post(`/auth/login`, post, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  cekLogin: async (isToken: string) => {
    console.log('isToken ', isToken);
    const response = await api.get(`/user`, {
      headers: {
        Authorization: `Bearer ${isToken}`,
      },
    });
    return response.data;
  },
  logout: async (isToken: string) => {
    console.log('isToken ', isToken);
    const response = await api.delete(
      `/auth/logout`,
      {
        headers: {
          Authorization: `Bearer ${isToken}`,
        },
      }
    );
    return response.data;
  },
};
