import axios from 'axios';
import { LoginData, LoginSSOData } from '@/types/types';
import * as Device from 'expo-device';
import * as Network from 'expo-network';
import { API_URL } from '@/utils/constants';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

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
    } else {
      jenisDevice = 'Emulator';
    }

    // console.log('Login function called with data:', JSON.stringify(data));

    const post = {
      username: data.username,
      password: data.password,
      manufacturer,
      modelName,
      osVersion,
      platformApiLevel,
      rooted,
      ipAddress,
      jenisDevice: jenisDevice,
    };

    // console.log('data post',post);

    const response = await api.post(`/auth/login`, post, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  loginSSO: async (data: LoginSSOData) => {
    const manufacturer = Device.manufacturer;
    const modelName = Device.modelName;
    const osVersion = Device.osVersion;
    const platformApiLevel = Device.platformApiLevel;
    const rooted = await Device.isRootedExperimentalAsync();
    const ipAddress = await Network.getIpAddressAsync();
    let jenisDevice;
    if (Device.isDevice) {
      jenisDevice = 'Phone';
    } else {
      jenisDevice = 'Emulator';
    }

    // console.log('Login function called with data:', JSON.stringify(data));

    const post = {
      email: data.email,
      manufacturer,
      modelName,
      osVersion,
      platformApiLevel,
      rooted,
      ipAddress,
      jenisDevice: jenisDevice,
    };

    // console.log('data post',post);

    const response = await api.post(`/auth/login_email`, post, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  cekLogin: async (isToken: string) => {
    // console.log('isToken ', isToken);
    const response = await api.get(`/user`, {
      headers: {
        Authorization: `Bearer ${isToken}`,
      },
    });
    return response.data;
  },
  logout: async (isToken: string) => {
    // console.log('isToken ', isToken);
    const response = await api.delete(`/auth/logout`, {
      headers: {
        Authorization: `Bearer ${isToken}`,
      },
    });
    await GoogleSignin.signOut();
    return response.data;
  },
};
