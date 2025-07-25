import ButtonCloseImage from '@/components/ButtonCloseImage';
import InputArea from '@/components/InputArea';
import ModalCamera from '@/components/ModalCamera';
import SkeletonList from '@/components/SkeletonList';
import { reLocation } from '@/hooks/locationRequired';
import secureApi from '@/services/service';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AntDesign, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import ButtonCostum from '@/components/ButtonCostum';
import { colors } from '@/constants/colors';
import { useQuery } from '@tanstack/react-query';
import { dataDetail } from '@/types/types';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { cn } from '@/utils/constants';
import { Image as ImageExpo } from 'expo-image';
import CustomNumberInput from '@/components/CustomNumberInput';
import { Toast } from 'toastify-react-native';

const fetchData = async (reservasi_id: string) => {
  const response = await secureApi.get(`/reservasi/cek_data_aktif`, {
    params: {
      reservasi_id: reservasi_id,
    },
  });
  return response.data;
};

export default function BbmUangScreen() {
  const { kendaraan_id, reservasi_id } = useLocalSearchParams();

  const [dialogCamera, setDialogCamera] = useState(false);
  const [loading, setLoading] = useState(false);

  const [typeImage, setTypeImage] = useState('');
  const [uriLokasi, setUriLokasi] = useState<string | null>(null);
  const [uriStruck, setUriStruck] = useState<string | null>(null);
  const [uang, setUang] = useState('');

  const { data, isLoading, error, isError } = useQuery<dataDetail>({
    queryKey: ['pengembalian', reservasi_id],
    queryFn: () => fetchData(reservasi_id.toString()),
  });

  if (isError) {
    Alert.alert('Peringatan!', 'Data tidak valid atau kendaraan tidak aktif!', [
      { text: 'Kembali', onPress: () => router.back() },
    ]);
  }

  const handleSubmitProsesBBM = async () => {
    setLoading(true);
    const coordinate = await reLocation.getCoordinate();

    if (!coordinate?.lat && coordinate?.long) {
      Alert.alert('Peringatan!', 'Error device location', [{ text: 'Tutup', onPress: () => null }]);
      return;
    }

    if (uriLokasi == null || uriStruck == null) {
      Toast.show({
        type: 'error',
        text1: 'Warning!',
        text2: 'Foto lokasi dan foto struck harus diisi',
        closeIconSize: 18,
        closeIconColor: '#ff0000',
      });
      setLoading(false);
      return;
    }

    if (uang == null || uang == '') {
      Toast.show({
        type: 'error',
        text1: 'Warning!',
        text2: 'Nominal uang harus diisi',
        closeIconSize: 18,
        closeIconColor: '#ff0000',
      });
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();

      formData.append('latitude', coordinate?.lat?.toString());
      formData.append('longitude', coordinate?.long.toString());
      formData.append('reservasi_id', reservasi_id ? reservasi_id.toString() : '');
      formData.append('kendaraan_id', kendaraan_id ? kendaraan_id.toString() : '');
      formData.append('jenis', 'Uang');
      formData.append('uang', uang);
      formData.append('imageLokasi', {
        uri: uriLokasi,
        name: 'lokasi-capture.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('imageStruck', {
        uri: uriStruck,
        name: 'struck-capture.jpg',
        type: 'image/jpeg',
      } as any);

      console.log('formData', formData);
      // return;
      await secureApi.postForm('/bbm/checkpoint_uang', formData);
      router.replace('/(protected)/(tabs)');
      // console.log('response save ', JSON.stringify(response));
      // await SecureStore.setItemAsync('Checkpoint', JSON.stringify(response.data));
      // handleDialogExit();
      // handleReload();
      setLoading(false);
    } catch (error: any) {
      if (error.response && error.response.data) {
        const msg = error.response.data.message || 'Terjadi kesalahan.';
        Toast.error(msg);
      } else if (error.request) {
        Alert.alert('Network Error', 'Tidak bisa terhubung ke server. Cek koneksi kamu.');
      } else {
        Alert.alert('Error', error.message);
      }
      setLoading(false);
    }
  };

  const handleOpenCamera = (type: string) => {
    setTypeImage(type);
    setDialogCamera(true);
  };

  return (
    <KeyboardAvoidingView
      className="bg-slate-300"
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 100}>
      <View className="absolute h-80 w-full rounded-bl-[50] rounded-br-[50]  bg-[#205781]" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="m-4 rounded-lg bg-white p-4">
          <View className="mb-3 items-center gap-4 py-2">
            <View className="flex-row items-center text-sm text-gray-500">
              <View className="flex-grow border-t border-gray-300" />
              <Text className="mx-2 text-lg font-bold text-[#205781]">
                Pengisian BBM Dengan Uang
              </Text>
              <View className="flex-grow border-t border-gray-300" />
            </View>
            <Text className="text-center">
              Proses pengisian BBM dengan Uang, silahkan ambil foto sekitar lokasi SPBU dan struck
              pengisian BBM Kendaraan.
            </Text>
          </View>
          <View className="gap-4">
            <View className="w-full gap-1">
              <Text className="text-sm">Foto lokasi pengisian BBM</Text>
              {!uriLokasi ? (
                <TouchableOpacity
                  className="flex-row items-center rounded-lg bg-indigo-500 px-3 py-1"
                  onPress={() => handleOpenCamera('lokasi')}>
                  <AntDesign name="camera" size={32} color={'white'} />
                  <Text className="ms-2 font-light text-white">Foto Lokasi</Text>
                </TouchableOpacity>
              ) : (
                <View className="w-full rounded-lg bg-black">
                  <Image source={{ uri: uriLokasi }} className="aspect-[3/4] w-full rounded-lg" />
                  <ButtonCloseImage onPress={() => setUriLokasi(null)} loading={loading} />
                </View>
              )}
            </View>
            <View className="w-full gap-1">
              <Text className="text-sm">Foto struck pembelian BBM</Text>
              {!uriStruck ? (
                <TouchableOpacity
                  className="flex-row items-center  rounded-lg bg-indigo-500 px-3 py-1"
                  onPress={() => handleOpenCamera('struck')}>
                  <AntDesign name="camera" size={32} color={'white'} />
                  <Text className="ms-2 font-light text-white">Stuck Pembelian</Text>
                </TouchableOpacity>
              ) : (
                <View className="w-full rounded-lg bg-black">
                  <Image source={{ uri: uriStruck }} className="aspect-[3/4] w-full rounded-lg" />
                  <ButtonCloseImage onPress={() => setUriStruck(null)} loading={loading} />
                </View>
              )}
            </View>

            <CustomNumberInput
              className="bg-gray-50"
              placeholder="Masukan nominal"
              label="Uang"
              onFormattedValue={(raw, formatted) => {
                setUang(raw);
                // console.log('Raw:', raw);
                // console.log('Formatted:', formatted);
              }}
            />
            <ButtonCostum
              classname={colors.secondary}
              title="Simpan Pengisian BBM"
              loading={loading}
              onPress={handleSubmitProsesBBM}
            />
          </View>
        </View>
      </ScrollView>
      <ModalCamera
        visible={dialogCamera}
        onClose={() => setDialogCamera(false)}
        setUriImage={(e) => (typeImage == 'lokasi' ? setUriLokasi(e) : setUriStruck(e))}
      />
    </KeyboardAvoidingView>
  );
}
