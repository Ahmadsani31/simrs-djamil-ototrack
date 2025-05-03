import * as TaskManager from 'expo-task-manager';
import { LocationObject } from 'expo-location';
import { useLocationStore } from '@/stores/locationStore';
// import { authService, tracking } from '@/services/api';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: LocationObject[] };
    console.log('Received new locations in background:', locations[0]);
    const latest = locations[0];

    if (latest) {
      console.log('location update ', latest.coords);
      const { latitude, longitude } = latest.coords;

      const newCoord = {
        latitude,
        longitude,
        timestamp: Date.now(),
      };

      // Akses Zustand store secara manual
      useLocationStore.getState().addToBatchCoordinate(newCoord);

      useLocationStore.getState().addToCoordinate(newCoord);
          // const token = await SecureStore.getItemAsync('token');
          // if (token) {
          //   const manufacturer = Device.manufacturer;
          //   const modelName = Device.modelName;
          //   const osVersion = Device.osVersion;
          //   const platformApiLevel = Device.platformApiLevel;
          //   try {
          //     await tracking.live_get({
          //       manufacturer,
          //       modelName,
          //       osVersion,
          //       platformApiLevel,
          //       locations: newCoord,
          //       timestamp: Date.now(),
          //     });
      
          //     //   console.log('✅ Batch terkirim:', batch.length);
          //   } catch (err) {
          //     console.error('❌ Gagal kirim:', err);
          //   }
          // }

      console.log('📍 Background Location:', latitude, longitude);
    }
  }
});

export default LOCATION_TASK_NAME;
