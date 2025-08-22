import { View, Text, TouchableOpacity } from 'react-native';
import { useCallback, useState } from 'react';
import { Link, router, useFocusEffect } from 'expo-router';
import secureApi from '@/services/service';
import { useLoadingStore } from '@/stores/loadingStore';
import PageDaily from '@/components/PageDaily';
import PageHome from '@/components/PageHome';
import { Toast } from 'toastify-react-native';
import HandleError from '@/utils/handleError';
import Feather from '@expo/vector-icons/Feather';
import { FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import BarcodeScannerCamera from '@/components/BarcodeScannerCamera';
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

  const [barcodeScanner, SetBarcodeScanner] = useState(false);

  const [rawData, setRawData] = useState<rawData>();
  const [rawDataService, setRawDataService] = useState<rawData[]>();

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
      // console.log('response', response);
      setRawData(response.data);
    } catch (error: any) {
      // console.log('response', error.response.data);
      setRawData(undefined);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataAktif = async () => {
    setLoading(true);
    try {
      const response = await secureApi.get(`service/aktif`);
      // console.log('response', response);
      setRawDataService(response.data);
    } catch (error: any) {
      // console.log('response', error.response.data);
      setRawDataService([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModalBarcode = (e: string) => {
    setJenisAksi(e);
    SetBarcodeScanner(true);
  };

  const handleScan = async (data: string) => {
    // console.log('Scanned data:', data);
    setLoading(true);
    SetBarcodeScanner(false);
    try {
      const res = await secureApi.get(`reservasi/qrcode`, {
        params: {
          uniqued_id: data,
        },
      });
      if (res.status === true) {
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
          Toast.show({
            type: 'error',
            text1: 'Perhatian!!',
            text2: 'QRCode salah atau tidak terdaftar pada system.',
          });
        }
      }
    } catch (error: any) {
      // console.log('Error fetching data:', error);
      // toast.info(error.response.data.message);
      HandleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View className="flex-1 bg-slate-300">
        <View className="absolute h-44 w-full rounded-bl-[50] rounded-br-[50]  bg-[#205781]" />

        <View className="px-4">
          {(rawDataService?.length ?? 0) > 0 ? (
            <Link href={'/(pemiliharaan)'} push asChild>
              <TouchableOpacity className={`rounded-lg border bg-sky-500 p-2`}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Feather name="info" size={24} color="white" />
                    <View>
                      <Text className="text-white">Pemeliharaan sedang aktif</Text>
                      {rawDataService?.length === 1 ? (
                        <Text className="font-bold text-white">
                          {rawDataService[0].kendaraan} {rawDataService[0].no_polisi}
                        </Text>
                      ) : (rawDataService?.length ?? 0) > 1 ? (
                        <Text>...Total ada {rawDataService?.length} kendaraan</Text>
                      ) : null}
                    </View>
                  </View>
                  <FontAwesome6 name="square-arrow-up-right" size={24} color="white" />
                </View>
              </TouchableOpacity>
            </Link>
          ) : null}

          {rawData ? (
            <PageDaily item={rawData} />
          ) : (
            <PageHome onPress={(e) => handleOpenModalBarcode(e)} />
          )}
        </View>
      </View>
      <View className="absolute bottom-1 right-1 z-10">
        <TouchableOpacity
          className="flex-row items-center gap-2 rounded-lg bg-[#205781] px-2 py-1"
          onPress={() => {
            fetchDataAktif();
            fetchData();
          }}>
          <Text className="text-white">Refresh</Text>
          <FontAwesome name="refresh" size={14} color="white" />
        </TouchableOpacity>
      </View>
      {barcodeScanner ? (
        <BarcodeScannerCamera
          onScan={handleScan}
          onVisible={() => SetBarcodeScanner(false)}
          visible={barcodeScanner}
        />
      ) : null}
    </View>
  );
}
