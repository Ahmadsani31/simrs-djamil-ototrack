import { View, Text, TouchableOpacity, Alert } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { colors } from '@/constants/colors';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import SkeletonList from './SkeletonList';
import { dataAktif } from '@/types/types';
import secureApi from '@/services/service';
import { startTracking, stopTracking } from '@/utils/locationUtils';
import { useLocationStore } from '@/stores/locationStore';

export default function ScreenPemakaianAktif({ onPress }: { onPress: () => void }) {
  const [rawData, setRawData] = useState<dataAktif>();
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      cekDataAktif();
    }, [])
  );
  // useEffect(() => {

  // }, []);

  const cekDataAktif = async () => {
    // console.log('cekDataAktif called');
    setIsLoading(true);
    try {
      const response = await secureApi.get(`reservasi/aktif`);

      if (response.status == true) {
        setRawData(response.data);
        await startTracking();
      } else {
        setRawData(undefined);
        useLocationStore.getState().clearCoordinates();
        await stopTracking();
      }
    } catch (error: any) {
      setRawData(undefined);
      if (error.request) {
        Alert.alert('Network Error', 'Tidak bisa terhubung ke server. Cek koneksi kamu.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <SkeletonList loop={1} />;
  }

  if (!rawData) {
    return (
      <>
        <View className="mb-4 ">
          <Text className="text-center text-2xl font-bold text-white">Scan Barcode Here</Text>
          <Text className="text-center text-sm text-white">
            Silahkan scan qrcode yang ada pada masing-masing kendaraan
          </Text>
        </View>
        <TouchableOpacity
          onPress={onPress}
          className={`flex-row items-center justify-center ${colors.primary} rounded-lg px-6 py-3`}>
          <MaterialIcons name="qr-code-scanner" size={24} color="white" />
          <Text className="ml-2 font-bold text-white">Scan Barcode</Text>
        </TouchableOpacity>
      </>
    );
  }

  return (
    <View className="rounded-lg bg-white p-4">
      <TouchableOpacity onPress={() => cekDataAktif()} className="absolute right-0 top-0">
        <Ionicons name="reload-circle" size={32} />
      </TouchableOpacity>
      <Text className="text-center">Kendaraan yang sedang digunakan</Text>
      <Text className="text-center text-3xl font-bold">{rawData?.name}</Text>
      <Text className="text-center font-semibold">{rawData?.no_polisi}</Text>
      <TouchableOpacity
        onPress={() => router.push('/(protected)/pemakaian')}
        className={`flex-row items-center justify-center ${colors.warning} my-4 rounded-lg px-6 py-3`}>
        <FontAwesome5 name="location-arrow" size={24} color="white" />
        <Text className="ml-2 font-bold text-white">Detail Pemakaian</Text>
      </TouchableOpacity>
    </View>
  );
}
