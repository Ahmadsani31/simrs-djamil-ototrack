import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from 'axios';
import * as Device from 'expo-device';
import * as Network from 'expo-network';

import { LoginData, LoginSSOData } from '@/types/types';
import { API_URL } from '@/utils/constants';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

const buildDeviceMeta = async () => {
  const manufacturer = Device.manufacturer;
  const modelName = Device.modelName;
  const osVersion = Device.osVersion;
  const platformApiLevel = Device.platformApiLevel;
  const rooted = await Device.isRootedExperimentalAsync();
  const ipAddress = await Network.getIpAddressAsync();
  const jenisDevice = Device.isDevice ? 'Phone' : 'Emulator';

  return {
    manufacturer,
    modelName,
    osVersion,
    platformApiLevel,
    rooted,
    ipAddress,
    jenisDevice,
  };
};

export const restApi = {
  login: async (data: LoginData) => {
    const meta = await buildDeviceMeta();
    const post = {
      username: data.username,
      password: data.password,
      ...meta,
    };

    const response = await api.post(`/auth/login`, post, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  loginSSO: async (data: LoginSSOData) => {
    const meta = await buildDeviceMeta();
    const post = {
      email: data.email,
      ...meta,
    };

    const response = await api.post(`/auth/login_email`, post, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  cekLogin: async (isToken: string) => {
    const response = await api.get(`/user`, {
      headers: {
        Authorization: `Bearer ${isToken}`,
      },
    });
    return response.data;
  },

  logout: async (isToken: string) => {
    const response = await api.delete(`/auth/logout`, {
      headers: {
        Authorization: `Bearer ${isToken}`,
      },
    });
    await GoogleSignin.signOut();
    return response.data;
  },
};
