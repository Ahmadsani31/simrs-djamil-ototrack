import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { SplashScreen } from 'expo-router';

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