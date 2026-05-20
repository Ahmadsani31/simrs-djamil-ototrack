// lib/secureStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

import { logger } from '@/utils/logger';

type Coordinate = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: string | null;
  timestamp: number;
};

/**
 * Read raw coords yang di-persist oleh `useLocationStore` ke AsyncStorage.
 * Kunci `tracking-data` harus konsisten dengan `name` di Zustand persist
 * config (lihat `stores/locationStore.ts`).
 */
export const getStoredCoords = async (): Promise<Coordinate[]> => {
  try {
    const rawData = await AsyncStorage.getItem('tracking-data');
    if (!rawData) return [];
    const parsed = JSON.parse(rawData);
    return parsed?.state?.coords ?? [];
  } catch (error) {
    logger.error('Gagal ambil coords:', error);
    return [];
  }
};

/**
 * Threshold di atas mana kita mulai downsample coords sebelum upload.
 * Trip pendek (<MAX_RAW) dikirim apa adanya untuk akurasi maksimum.
 * Trip panjang di-downsample agar payload tidak meledak.
 */
const MAX_RAW = 1000;
const TARGET_AFTER_DOWNSAMPLE = 1000;

/**
 * Always keep first + last coordinate so titik mulai/akhir trip tidak
 * pernah hilang. Yang di-thinning hanya bagian tengah.
 *
 * Contoh: 5000 coords → step = ceil(5000/1000) = 5 → ambil tiap-5
 * → ~1000 coords output.
 */
export const downsampleCoords = (coords: Coordinate[]): Coordinate[] => {
  if (coords.length <= MAX_RAW) return coords;

  const step = Math.ceil(coords.length / TARGET_AFTER_DOWNSAMPLE);
  if (step <= 1) return coords;

  const result: Coordinate[] = [];
  for (let i = 0; i < coords.length; i += step) {
    result.push(coords[i]);
  }
  // Pastikan koordinat terakhir selalu masuk supaya endpoint trip akurat.
  const last = coords[coords.length - 1];
  if (result[result.length - 1] !== last) {
    result.push(last);
  }
  return result;
};

/**
 * Convenience: ambil coords dari storage + downsample sekaligus.
 * Pakai ini di flow pengembalian agar payload aman.
 */
export const getCoordsForUpload = async (): Promise<Coordinate[]> => {
  const raw = await getStoredCoords();
  return downsampleCoords(raw);
};
