import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

import { colors } from '@/constants/colors';
import { LOCATION_TASK_NAME } from '@/utils/backgroundLocationTask';

export async function startTracking() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  const bgStatus = await Location.requestBackgroundPermissionsAsync();
  if (status !== 'granted' || bgStatus.status !== 'granted') {
    Alert.alert(
      'Izin lokasi diperlukan',
      'Aplikasi membutuhkan akses lokasi (foreground & background) untuk merekam rute pemakaian kendaraan. Aktifkan izin di pengaturan.'
    );
    return;
  }

  const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (!isRunning) {
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
  }
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
  //   const { coords: { latitude: lat1, longitude: lon1 } } = await Location.getCurrentPositionAsync();
  //     const { coords: { latitude: lat2, longitude: lon2 } } = await Location.getCurrentPositionAsync();

  const R = 6371e3; // meters
  const φ1 = (lastLatitude * Math.PI) / 180; // φ, λ in radians
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
