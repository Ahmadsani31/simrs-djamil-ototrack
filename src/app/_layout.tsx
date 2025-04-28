import { Slot, SplashScreen, Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAutoLogin } from '../hooks/useAutoLogin';
import { ScreenContent } from '@/components/ScreenContent';
import { StatusBar } from 'expo-status-bar';

import '../../global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isLoading } = useAutoLogin();

  if (isLoading) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}


