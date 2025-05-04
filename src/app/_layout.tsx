import { router, Slot, SplashScreen, Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAutoLogin } from '../hooks/useAutoLogin';
import { StatusBar } from 'expo-status-bar';

import '../../global.css';
import Loader from '@/components/Loader';
import { useEffect } from 'react';
import { Alert, BackHandler } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import '@/utlis/backgroundLocationTask';
import * as Location from 'expo-location'

import * as Device from 'expo-device';

const BACKGROUND_TASK = 'background-location-task';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  const { isLoading } = useAutoLogin();
  useEffect(() => {

    if (Device.isDevice) {
      console.log('real device');
    }else{
      console.log('use emulator');
    }


    const requestPermissions = async () => {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_TASK);
      console.log('hasStartedLocationUpdatesAsync',hasStarted);
    };

    requestPermissions();
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (router.canGoBack()) {
        // Kalau masih bisa mundur (ada history), cukup back saja
        router.back();
      } else {
        // Kalau tidak bisa mundur (sudah di root), tampilkan alert keluar
        Alert.alert(
          'Konfirmasi Keluar',
          'Apakah Anda yakin ingin keluar dari aplikasi?',
          [
            {
              text: 'Tidak',
              onPress: () => null,
              style: 'cancel',
            },
            {
              text: 'Ya',
              onPress: () => BackHandler.exitApp(),
            },
          ]
        );
      }

      return true; // <- Wajib! Supaya sistem back tidak langsung nutup
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [router]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}


