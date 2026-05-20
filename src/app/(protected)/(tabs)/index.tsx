import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';
import { Link, router, useFocusEffect } from 'expo-router';
import secureApi from '@/services/service';
import { useLoadingStore } from '@/stores/loadingStore';
import PageDaily from '@/components/sections/PageDaily';
import PageHome from '@/components/sections/PageHome';
import { Toast } from 'toastify-react-native';
import HandleError from '@/utils/handleError';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import BarcodeScannerCamera from '@/components/scanner/BarcodeScannerCamera';
import { colors } from '@/constants/colors';

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
  const insets = useSafeAreaInsets();
  const setLoading = useLoadingStore((state) => state.setLoading);
  const [jenisAksi, setJenisAksi] = useState('');
  const [barcodeScanner, setBarcodeScanner] = useState(false);
  const [rawData, setRawData] = useState<rawData>();
  const [rawDataService, setRawDataService] = useState<rawData[]>();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchData();
      fetchDataAktif();
    }, [])
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await secureApi.get(`reservasi/aktif`);
      setRawData(response.data);
    } catch {
      setRawData(undefined);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataAktif = async () => {
    try {
      const response = await secureApi.get(`service/aktif`);
      setRawDataService(response.data);
    } catch {
      setRawDataService([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchData(), fetchDataAktif()]);
    setRefreshing(false);
  };

  const handleOpenModalBarcode = (e: string) => {
    setJenisAksi(e);
    setBarcodeScanner(true);
  };

  const handleScan = async (data: string) => {
    setLoading(true);
    setBarcodeScanner(false);
    try {
      const res = await secureApi.get(`reservasi/qrcode`, { params: { uniqued_id: data } });
      if (res.status === true) {
        if (jenisAksi == 'daily') {
          router.push({ pathname: '/(protected)/detail', params: { uuid: data } });
        } else if (jenisAksi == 'service') {
          router.push({ pathname: '/(protected)/service', params: { uuid: data } });
        } else {
          Toast.show({ type: 'error', text1: 'Perhatian', text2: 'QRCode tidak valid' });
        }
      }
    } catch (error: any) {
      HandleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-200">
      {/* Header */}
      <View className="bg-brand px-4 pb-10" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-bold text-white">Dashboard</Text>
            <Text className="text-xs text-white/60">Pencatatan Kendaraan Operasional</Text>
          </View>
          <TouchableOpacity
            onPress={onRefresh}
            className="rounded-full bg-white/15 p-2.5"
            activeOpacity={0.7}>
            <Feather name="refresh-cw" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 -mt-4"
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Active maintenance alert */}
        {(rawDataService?.length ?? 0) > 0 && (
          <Link href={'/(pemiliharaan)'} push asChild>
            <TouchableOpacity
              className="mx-4 mb-3 flex-row items-center justify-between rounded-2xl bg-sky-500 p-4"
              activeOpacity={0.8}>
              <View className="flex-1 flex-row items-center gap-3">
                <View className="rounded-full bg-white/20 p-2">
                  <MaterialCommunityIcons name="car-wrench" size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-white">Pemeliharaan Aktif</Text>
                  {rawDataService?.length === 1 ? (
                    <Text className="text-xs text-white/80">
                      {rawDataService[0].kendaraan} - {rawDataService[0].no_polisi}
                    </Text>
                  ) : (
                    <Text className="text-xs text-white/80">
                      {rawDataService?.length} kendaraan sedang dipelihara
                    </Text>
                  )}
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="white" />
            </TouchableOpacity>
          </Link>
        )}

        {/* Main content */}
        <View className="mx-4">
          {rawData ? (
            <PageDaily item={rawData} />
          ) : (
            <PageHome onPress={(e) => handleOpenModalBarcode(e)} />
          )}
        </View>
      </ScrollView>

      {/* Barcode Scanner */}
      {barcodeScanner && (
        <BarcodeScannerCamera
          onScan={handleScan}
          onVisible={() => setBarcodeScanner(false)}
          visible={barcodeScanner}
        />
      )}
    </View>
  );
}
