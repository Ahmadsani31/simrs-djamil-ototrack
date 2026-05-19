import * as TaskManager from 'expo-task-manager';
import { LocationObject } from 'expo-location';
import { useLocationStore } from '@/stores/locationStore';

export const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    if (__DEV__) console.log('Background location task error:', error);
    return;
  }

  if (!data) return;

  const { locations } = data as { locations: LocationObject[] };
  const latest = locations[0];
  if (!latest) return;

  const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } =
    latest.coords;
  // Convert speed from m/s to km/h
  const kmh = speed ? (speed * 3.6).toFixed(1) : '0.0';

  const saveCoords = {
    latitude,
    longitude,
    accuracy,
    altitude,
    altitudeAccuracy,
    heading,
    speed: kmh,
    timestamp: Date.now(),
  };

  // Akses Zustand store secara manual (di luar React tree).
  useLocationStore.getState().addToBatchCoordinate(saveCoords);
  useLocationStore.getState().addToCoordinate(saveCoords);
});

export default LOCATION_TASK_NAME;

