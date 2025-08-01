import { View, Alert, SafeAreaView } from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import BottomSheet, { BottomSheetView, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import BarcodeScanner from '@/components/BarcodeScanner';
import { router } from 'expo-router';
import secureApi from '@/services/service';
import { useLoadingStore } from '@/stores/loadingStore';
import PageDaily from '@/components/PageDaily';
import PageService from '@/components/PageService';
import PageHome from '@/components/PageHome';
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await secureApi.get(`reservasi/aktif`);
      // console.log('response', response);
      setRawData(response.data);
    } catch (error: any) {
      // console.log('response', error.response.data);
      setRawData(undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 bg-slate-300">
        <View className="absolute h-44 w-full rounded-bl-[50] rounded-br-[50]  bg-[#205781]" />

        <View className="px-4">
          {rawData ? (
            rawData.name == 'DAILY' ? (
              <PageDaily item={rawData} />
            ) : (
              <PageService item={rawData} />
            )
          ) : (
            <PageHome onPress={(e) => handleSnapPress(e)} />
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
        <BottomSheetView
          style={{
            flex: 1,
            padding: 36,
            height: '100%',
            alignItems: 'center',
            backgroundColor: '#4f4f4f',
          }}>
          {camera && <BarcodeScanner onScan={handleScan} />}
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}
