import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';

import { colors } from '@/constants/colors';
import { LOCATION_TASK_NAME } from '@/utils/backgroundLocationTask';

const openSettings = () => {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
};

/**
 * Mulai background location tracking. Mengembalikan `true` kalau berhasil
 * (atau sudah jalan), `false` kalau permission tidak lengkap.
 *
 * Permission dialog di-trigger lazy: foreground harus granted dulu, baru
 * Android tampilkan prompt untuk "Allow all the time" (background). Kalau
 * user denied, kasih Alert dengan tombol shortcut ke pengaturan.
 */
export async function startTracking(): Promise<boolean> {
  // 1. Foreground permission first (Android requires this before background)
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== 'granted') {
    Alert.alert(
      'Izin lokasi diperlukan',
      'Aplikasi membutuhkan akses lokasi untuk merekam rute pemakaian kendaraan.',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Buka Pengaturan', onPress: openSettings },
      ]
    );
    return false;
  }

  // 2. Background permission. On Android 10+ this triggers a separate dialog
  //    that lets the user pick "Allow all the time" — needed so tracking
  //    survives when the user locks the screen mid-trip.
  const bg = await Location.requestBackgroundPermissionsAsync();
  if (bg.status !== 'granted') {
    Alert.alert(
      'Izin lokasi background diperlukan',
      'Pilih "Izinkan sepanjang waktu" agar aplikasi dapat merekam rute saat layar terkunci. Tanpa izin ini rute tidak akan tercatat lengkap.',
      [
        { text: 'Nanti', style: 'cancel' },
        { text: 'Buka Pengaturan', onPress: openSettings },
      ]
    );
    return false;
  }

  const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (isRunning) return true;

  /**
   * Sampling rate balance: cukup detail untuk merekam rute kendaraan
   * tapi hemat baterai. 5 detik / 10 meter cukup untuk kecepatan kendaraan
   * normal di kota; jika kendaraan diam, distanceInterval mencegah kirim
   * koordinat duplikat.
   *
   * `Location.Accuracy.High` (~10m) cukup baik dan jauh lebih hemat dari
   * `Highest` yang memaksa GPS full power.
   */
  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.High,
    timeInterval: 5000,
    distanceInterval: 10,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Oto RS-Djamil',
      notificationBody: 'Aplikasi sedang memantau lokasi Anda dalam pemakaian kendaraan',
      notificationColor: colors.brand,
      killServiceOnDestroy: false,
    },
  });
  return true;
}

export async function stopTracking() {
  const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (isRunning) {
    await AsyncStorage.removeItem('tracking-data');
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  }
}

export async function calculateDistanceLocation({
  lastLatitude,
  lastLongitude,
  lat2,
  lon2,
}: {
  lastLatitude: number;
  lastLongitude: number;
  lat2: number;
  lon2: number;
}) {
  const R = 6371e3; // meters
  const φ1 = (lastLatitude * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lastLatitude) * Math.PI) / 180;
  const Δλ = ((lon2 - lastLongitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // in meters
  return Math.round(distance);
}
