import { useEffect } from 'react';
import { SplashScreen } from 'expo-router';
import { useAuthStore } from '../stores/authStore';

export const useAutoLogin = () => {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    const prepare = async () => {
      try {
        await checkAuth();
      } finally {
        SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  return { isLoading };
};