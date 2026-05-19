import LoadingIndikator from '@/components/feedback/LoadingIndikator';
import { PrivateRoute } from '@/components/layout/PrivateRoute';
import { useLoadingStore } from '@/stores/loadingStore';
import { router, Stack } from 'expo-router';
import { useEffect } from 'react';
import { Alert, BackHandler, Image, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@/constants/colors';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

const BrandHeaderLeft = () => (
  <View className="w-44 flex-row items-center gap-1 rounded-lg bg-white p-1">
    <Image
      style={{ width: 53, height: 30 }}
      source={require('@asset/images/logo/logo-kemenkes.png')}
    />
    <Text className="font-bold">Oto RS-Djamil</Text>
  </View>
);

const BackHeaderRight = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity className="rounded-full bg-white p-1" onPress={onPress}>
    <Ionicons name="arrow-back-circle" size={24} color="red" />
  </TouchableOpacity>
);

/**
 * Header default semua screen di (protected): logo Kemenkes di kiri,
 * tombol back di kanan. Pemakaian: `options={brandHeader(backAction)}`.
 */
const brandHeader = (onBack: () => void): NativeStackNavigationOptions => ({
  headerShown: true,
  headerTitle: '',
  headerLeft: () => <BrandHeaderLeft />,
  headerRight: () => <BackHeaderRight onPress={onBack} />,
});

/**
 * Varian dengan posisi tombol back di kiri (dipakai untuk screen bbm-* dan
 * pengembalian-service*). Tetap kasih nama agar konsisten dengan layout asli.
 */
const brandHeaderBackLeft = (onBack: () => void): NativeStackNavigationOptions => ({
  headerShown: true,
  headerTitle: '',
  headerLeft: () => <BackHeaderRight onPress={onBack} />,
  headerRight: () => <BrandHeaderLeft />,
});

export default function ProtectedLayout() {
  const loading = useLoadingStore((state) => state.loading);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const backAction = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      Alert.alert('Konfirmasi Keluar', 'Apakah Anda yakin ingin keluar dari aplikasi home?', [
        {
          text: 'Batal',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'Keluar',
          onPress: () => BackHandler.exitApp(),
        },
      ]);
    }

    return true; // Wajib supaya sistem back tidak langsung nutup
  };

  return (
    <PrivateRoute>
      {loading && <LoadingIndikator />}
      <Stack
        screenOptions={{
          headerTitleAlign: 'center',
          headerShown: false,
          headerStyle: {
            backgroundColor: colors.brand,
          },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Screens dengan logo kiri + back kanan */}
        <Stack.Screen name="detail" options={brandHeader(backAction)} />
        <Stack.Screen name="service" options={brandHeader(backAction)} />
        <Stack.Screen name="pengembalian" options={brandHeader(backAction)} />
        <Stack.Screen name="pengembalian_manual" options={brandHeader(backAction)} />

        {/* Screens dengan back kiri + logo kanan */}
        <Stack.Screen name="bbm-voucher" options={brandHeaderBackLeft(backAction)} />
        <Stack.Screen name="bbm-uang" options={brandHeaderBackLeft(backAction)} />
        <Stack.Screen name="pengembalian-service" options={brandHeaderBackLeft(backAction)} />
        <Stack.Screen
          name="pengembalian-service-manual"
          options={brandHeaderBackLeft(backAction)}
        />

        {/* Modal */}
        <Stack.Screen
          name="pemiliharaan-detail"
          options={{
            ...brandHeaderBackLeft(backAction),
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>
    </PrivateRoute>
  );
}
