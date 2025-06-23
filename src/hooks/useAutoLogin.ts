import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
// import { SplashScreen } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Location from 'expo-location';

const LOCATION_TASK_NAME = 'background-location-task';

export const useAutoLogin = () => {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    const requestLocationPermission = async () => {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log('Location background started:', hasStarted);
    };

    const prepare = async () => {
      try {
        await checkAuth();
      } finally {
        SplashScreen.hideAsync();
      }
    };

    requestLocationPermission();

    prepare();
  }, []);

  return { isLoading };
};
