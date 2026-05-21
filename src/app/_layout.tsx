import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, BackHandler } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ToastManager from 'toastify-react-native';

import { useAutoLogin } from '../hooks/useAutoLogin';

import '../../global.css';
import Loader from '@/components/feedback/Loader';

import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import '@/utils/backgroundLocationTask';
import NotifikasiNewVersion from '@/components/modals/NotifikasiNewVersion';
import NotifikasiNewVersionMinor from '@/components/modals/NotifikasiNewVersionMinor';
import { APPEL_CLIENT_ID, GOOGLE_CLIENT_ID } from '@/utils/constants';
import { logger } from '@/utils/logger';

SplashScreen.preventAutoHideAsync();

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

// Agar notifikasi tetap tampil saat app di foreground (SDK 55 API).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Optional: Configure global query options
      staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    },
  },
});

export default function RootLayout() {
  const { isLoading } = useAutoLogin();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_CLIENT_ID,
      iosClientId: APPEL_CLIENT_ID,
      profileImageSize: 120,
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        // Foreground location: needed for QR scan flow + ad-hoc coordinate
        // capture in detail/pengembalian. Background permission is deferred
        // to `startTracking()` (only requested when driver actually starts a
        // pemakaian) so first-launch onboarding only asks for what's needed
        // right now.
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        if (locationStatus !== 'granted') {
          Alert.alert(
            'Izin lokasi diperlukan',
            'Aplikasi membutuhkan akses lokasi untuk merekam koordinat saat memulai/mengembalikan kendaraan. Aktifkan izin di pengaturan.'
          );
        }

        // Camera: dipakai di banyak alur (QR scan, foto spidometer, struk).
        const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
          Alert.alert(
            'Izin kamera diperlukan',
            'Aplikasi membutuhkan akses kamera untuk scan QR dan foto spidometer.'
          );
        }

        setIsReady(true);
      } catch (error) {
        logger.error('Error requesting permissions:', error);
        setIsReady(true);
      }
    })();
    registerForPushNotificationsAsync();
  }, []);

  async function registerForPushNotificationsAsync() {
    const existing = await Notifications.getPermissionsAsync();
    let isGranted = (existing as { granted?: boolean }).granted ?? false;

    if (!isGranted) {
      const requested = await Notifications.requestPermissionsAsync();
      isGranted = (requested as { granted?: boolean }).granted ?? false;
    }

    if (!isGranted) {
      Alert.alert(
        'Notifikasi Diperlukan',
        `Aplikasi memerlukan izin notifikasi untuk digunakan.`,
        [
          {
            text: 'Request notifikasi',
            onPress: async () => {
              await Notifications.requestPermissionsAsync();
            },
          },
        ],
        { cancelable: false }
      );
    }
  }

  useEffect(() => {
    const backAction = () => {
      if (router.canGoBack()) {
        // Kalau masih bisa mundur (ada history), cukup back saja
        router.back();
      } else {
        // Kalau tidak bisa mundur (sudah di root), tampilkan alert keluar
        Alert.alert('Konfirmasi Keluar', 'Apakah Anda yakin ingin keluar dari aplikasi?', [
          {
            text: 'Tidak',
            onPress: () => null,
            style: 'cancel',
          },
          {
            text: 'Ya',
            onPress: () => BackHandler.exitApp(),
          },
        ]);
      }

      return true; // <- Wajib! Supaya sistem back tidak langsung nutup
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [router]);

  if (isLoading || !isReady) {
    return <Loader />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="auto" />
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
          <NotifikasiNewVersion />
          <NotifikasiNewVersionMinor />
          <ToastManager useModal={true} />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
