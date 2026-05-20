import { LocationObject } from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { useLocationStore } from '@/stores/locationStore';

export const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    if (__DEV__) console.log('Background location task error:', error);
    return;
  }

  if (!data) return;

  const { locations } = data as { locations: LocationObject[] };
  if (!locations?.length) return;

  // OS sometimes batches updates while the app is backgrounded/dozing.
  // Persist *every* location in the batch so we don't lose route detail.
  for (const loc of locations) {
    const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } =
      loc.coords;
    // Convert speed from m/s to km/h. Native value can be -1 / null when unknown.
    const kmh = speed && speed > 0 ? (speed * 3.6).toFixed(1) : '0.0';

    useLocationStore.getState().addToBatchCoordinate({
      latitude,
      longitude,
      accuracy,
      altitude,
      altitudeAccuracy,
      heading,
      speed: kmh,
      timestamp: loc.timestamp ?? Date.now(),
    });
  }
});

export default LOCATION_TASK_NAME;
