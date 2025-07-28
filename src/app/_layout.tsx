import { router, Slot, Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAutoLogin } from '../hooks/useAutoLogin';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../../global.css';
import Loader from '@/components/Loader';
import { useEffect, useState } from 'react';
import { Alert, BackHandler, Platform, Text, UIManager } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Updates from 'expo-updates';

import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import ToastManager from 'toastify-react-native';
import '@/utils/backgroundLocationTask';
import { APPEL_CLIENT_ID, GOOGLE_CLIENT_ID } from '@/utils/constants';
import { colorKeys } from 'moti';

SplashScreen.preventAutoHideAsync();

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
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
  GoogleSignin.configure({
    webClientId: GOOGLE_CLIENT_ID,
    iosClientId: APPEL_CLIENT_ID,
    profileImageSize: 120,
  });

  const { isLoading } = useAutoLogin();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Request location permission
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        const bgStatus = await Location.requestBackgroundPermissionsAsync();
        if (locationStatus !== 'granted' || bgStatus.status !== 'granted') {
          Alert.alert('Izin diperlukan', 'Aplikasi memerlukan akses lokasi untuk digunakan.');
          return;
        }

        // Request camera permission
        const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
          Alert.alert('Izin diperlukan', 'Aplikasi memerlukan akses kamera untuk digunakan.');
          return;
        }

        // Jika semua izin disetujui
        setIsReady(true);
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    })();

    checkAppUpdate();
    registerForPushNotificationsAsync();
  }, []);

  async function registerForPushNotificationsAsync() {
    const { status } = await Notifications.getPermissionsAsync();
    let finalStatus = status;

    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      finalStatus = newStatus;
    }

    if (finalStatus !== 'granted') {
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
      return;
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

  const checkAppUpdate = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        const metadata = Updates.manifest;
        // console.log('====================================');
        // console.log('Update Tersedia:', metadata);
        // console.log('====================================');
        Alert.alert(
          'Update Tersedia',
          `Versi baru aplikasi tersedia. Silahkan Update dan Aplikasi akan diperbarui.`,
          [
            {
              text: 'Update Sekarang',
              onPress: async () => {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync(); // Restart dengan update
              },
            },
          ],
          { cancelable: false }
        );
      }
    } catch (e) {
      console.warn('Gagal memeriksa pembaruan:', e);
    }
  };

  if (isLoading || !isReady) {
    return <Loader />;
  }

  // if (!isReady) {
  //   return <RequiredPermission />
  // }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="inverted" animated={true} />
          <Slot />
          <ToastManager useModal={true} />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
