import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
const LOCATION_TASK_NAME = 'background-location-task';

export async function startTracking() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  const bgStatus = await Location.requestBackgroundPermissionsAsync();
  if (status !== 'granted' || bgStatus.status !== 'granted') {
    alert('Location permission not granted');
    return;
  }

  const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (!isRunning) {
    //location akan di ambil setiap 30 detik dan jarak 10 meter
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Highest, // ubah ke akurasi tertinggi
      timeInterval: 1000, // update setiap 1 detik
      distanceInterval: 0, // update sekecil apapun gerakan
      deferredUpdatesDistance: 0, // kirim langsung, jangan tunggu
      deferredUpdatesTimeout: 1000, // maksimum delay 1 detik
      pausesUpdatesAutomatically: false, // terus update walau idle
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Pemakaian Aktif',
        notificationBody: 'Aplikasi aktif dan berjalan di background untuk pemakaian kendaraan',
        notificationColor: '#04b8a3',
        killServiceOnDestroy: false, // jangan matikan service saat aplikasi ditutup
        
        // Optional: Add a custom icon for the notification
        // notificationIcon: 'path/to/your/icon.png',
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
