import { View, Alert, TouchableOpacity, Text, ScrollView, RefreshControl } from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import BottomSheet, { BottomSheetView, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import BarcodeScanner from '@/components/BarcodeScanner';
import { router } from 'expo-router';
import SafeAreaView from '@/components/SafeAreaView';
import secureApi from '@/services/service';
import { Image } from 'expo-image';
import { useLoadingStore } from '@/stores/loadingStore';
import PageDaily from '@/components/PageDaily';
import PageService from '@/components/PageService';
// import * as Location from 'expo-location';

// const LOCATION_TASK_NAME = 'background-location-task';

type rawData = {
  id: number;
  name: string;
  kendaraan: string;
  kendaraan_id: string;
  no_polisi: string;
  kegiatan: string;
  created_at: string;
  keterangan: string;
  jenis_kerusakan: string;
  lokasi: string;
};

export default function IndexScreen() {
  const setLoading = useLoadingStore((state) => state.setLoading);

  const [jenisAksi, setJenisAksi] = useState('');

  const [camera, setCamera] = useState(false);

  useEffect(() => {
    fetchData();
    // getValueFor();
  }, []);

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 80,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 500,
  });

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      // console.log('BottomSheet closed with swipe down.');
      // Lakukan aksi lain jika ditutup
      setCamera(false);
    }
  }, []);

  const handleSnapPress = useCallback((value: string) => {
    setCamera(true);
    setJenisAksi(value);
    bottomSheetRef.current?.expand();
  }, []);

  const handleScan = async (data: string) => {
    // console.log('Scanned data:', data);
    try {
      const res = await secureApi.get(`reservasi/qrcode`, {
        params: {
          uniqued_id: data,
        },
      });
      if (res.status === true) {
        setCamera(false);
        // setUuid(data);
        if (jenisAksi == 'daily') {
          router.push({
            pathname: '/(protected)/detail',
            params: { uuid: data },
          });
        } else if (jenisAksi == 'service') {
          router.push({
            pathname: '/(protected)/service',
            params: { uuid: data },
          });
        } else {
          Alert.alert('Scan Error', 'QRCode salah atau tidak terbaca.');
        }
      }
    } catch (error: any) {
      // console.log('Error fetching data:', error);
      // toast.info(error.response.data.message);
      if (error.response && error.response.data) {
        const msg = error.response.data.message || 'Terjadi kesalahan.';
        Alert.alert('Warning!', msg, [{ text: 'Tutup', style: 'cancel' }]);
      } else if (error.request) {
        Alert.alert('Network Error', 'Tidak bisa terhubung ke server. Cek koneksi kamu.');
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      bottomSheetRef.current?.close();
    }
  };

  const [rawData, setRawData] = useState<rawData>();

  // async function getValueFor() {
  //   let result = await SecureStore.getItemAsync('DataAktif');
  //   const resultParsed = result ? JSON.parse(result) : undefined;
  //   console.log('SecureStore', resultParsed.kendaraan_id);
  //   setRawData(result ? JSON.parse(result) : undefined);
  // }

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await secureApi.get(`reservasi/aktif`);
      console.log('response', response);

      setRawData(response.data);
    } catch (error: any) {
      console.log('response', error.response.data);
      setRawData(undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView noTop>
      <View className="flex-1 bg-slate-300">
        <View className="absolute h-44 w-full rounded-bl-[50] rounded-br-[50]  bg-[#205781]" />
        {/* <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={fetchData}
              colors={['#205781']}
              progressBackgroundColor="#fff"
            />
          }></ScrollView> */}

        <View className="px-4">
          {rawData ? (
            rawData.name == 'DAILY' ? (
              <PageDaily item={rawData} />
            ) : (
              <PageService item={rawData} />
            )
          ) : (
            <>
              <View className="my-10 ">
                <Text className="text-center text-2xl font-bold text-white">
                  Pilih Jenis Penggunaan
                </Text>
                <Text className="text-center text-sm text-white">
                  Silahkan pilih jenis penggunaan dan scan qrcode yang ada pada masing-masing
                  kendaraan
                </Text>
              </View>
              <View className="mt-10">
                <View className="flex-row items-center justify-center gap-4 rounded-lg bg-white p-5">
                  <TouchableOpacity
                    className="size-48 items-center justify-center gap-2 rounded-lg bg-green-300 p-2"
                    onPress={() => handleSnapPress('daily')}>
                    <Image
                      style={{ flex: 1, width: '100%' }}
                      source={require('@asset/images/daily-use.png')}
                      contentFit="contain"
                      transition={500}
                    />
                    <Text className="font-bold">Aktifitas Harian</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="size-48 items-center justify-center gap-2 rounded-lg bg-amber-300 p-2 shadow"
                    onPress={() => handleSnapPress('service')}>
                    <Image
                      style={{ flex: 1, width: '100%' }}
                      source={require('@asset/images/maintenance.png')}
                      contentFit="contain"
                      transition={500}
                    />
                    <Text className="font-bold">Service Kendaraan</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={['100%']}
        index={-1}
        enablePanDownToClose={true}
        animationConfigs={animationConfigs}
        onChange={handleSheetChanges}>
        <BottomSheetView className="flex-1 items-center justify-center bg-slate-300">
          {camera && <BarcodeScanner onScan={handleScan} />}
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}
