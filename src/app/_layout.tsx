import { router, Slot, SplashScreen, Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAutoLogin } from '../hooks/useAutoLogin';
import { StatusBar } from 'expo-status-bar';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import '../../global.css';
import Loader from '@/components/Loader';
import { useEffect, useState } from 'react';
import { Alert, BackHandler, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Updates from 'expo-updates';

import '@/utlis/backgroundLocationTask';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient()

export default function RootLayout() {

  const { isLoading } = useAutoLogin();

  useEffect(() => {
    checkAppUpdate();
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

  const checkAppUpdate = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        Alert.alert(
          'Update Tersedia',
          'Versi baru aplikasi tersedia. Aplikasi akan diperbarui.',
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

  if (isLoading) {
    return <Loader />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }} />
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}


