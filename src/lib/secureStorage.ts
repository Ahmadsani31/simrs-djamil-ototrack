// lib/secureStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getStoredCoords = async () => {
  try {
    const rawData = await AsyncStorage.getItem('tracking-data'); // Sesuaikan dengan nama `name` di persist
    if (!rawData) return [];

    const parsed = JSON.parse(rawData);
    const coords = parsed?.state?.coords || [];
    
    return coords;
  } catch (error) {
    console.error('Gagal ambil coords:', error);
    return [];
  }
};

