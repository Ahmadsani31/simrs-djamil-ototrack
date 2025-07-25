import ButtonCloseImage from '@/components/ButtonCloseImage';
import ModalCamera from '@/components/ModalCamera';
import SkeletonList from '@/components/SkeletonList';
import { reLocation } from '@/hooks/locationRequired';
import secureApi from '@/services/service';
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
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { cn } from '@/utils/constants';
import { Image as ImageExpo } from 'expo-image';
import { Toast } from 'toastify-react-native';
import { useQuery } from '@tanstack/react-query';

const fetchData = async (kendaraan_id: string) => {
  const response = await secureApi.get(`/bbm`, {
    params: {
      kendaraan_id: kendaraan_id,
    },
  });
  return response.data;
};

type propsBBMVoucher = {
  checkpoint_id: string;
  kendaraan_id: string;
  bbm_id: string;
  liter: string;
};

export default function BbmVoucherScreen() {
  const { kendaraan_id, reservasi_id } = useLocalSearchParams();

  const [dialogCamera, setDialogCamera] = useState(false);

  const [loading, setLoading] = useState(false);
  const [typeImage, setTypeImage] = useState('');
  const [uriLokasi, setUriLokasi] = useState<string | null>(null);
  const [uriStruck, setUriStruck] = useState<string | null>(null);

  const { data, isLoading, error, isError } = useQuery<propsBBMVoucher>({
    queryKey: ['bbm-voucher', kendaraan_id],
    queryFn: () => fetchData(kendaraan_id.toString()),
  });

  console.log(error);
  console.log(data);

  if (isError) {
    return (
      <View className="flex-1 items-center justify-start bg-white p-4">
        <ImageExpo
          source={require('assets/images/gif/forbidden.gif')}
          style={{ width: 300, height: 300 }}
          transition={1000}
        />
        <View className="m-5 flex-row items-center gap-3 rounded-lg bg-red-500 p-5">
          <AntDesign name="exclamationcircle" size={24} color="white" />
          <Text className="font-bold text-white">
            Pengisian BBM dengan VOUCHER dibatasi, silahkan hubungi admin atau yang yang terkait
            untuk pengajuan pengisian BBM dengan voucher
          </Text>
        </View>
        <TouchableOpacity
          className={cn('mt-4 flex-row items-center gap-2 rounded-lg p-3', colors.primary)}
          onPress={() => router.back()}>
          <Entypo name="back" size={24} color="white" />
          <Text className="text-white">Kembali</Text>
        </TouchableOpacity>
      </View>
    );
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

    try {
      const formData = new FormData();

      formData.append('id', data?.checkpoint_id || '');

      formData.append('latitude', coordinate?.lat?.toString());
      formData.append('longitude', coordinate?.long.toString());
      formData.append('reservasi_id', reservasi_id ? reservasi_id.toString() : '');
      formData.append('kendaraan_id', data?.kendaraan_id || '');
      formData.append('bbm_id', data?.bbm_id || '');
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
      const response = await secureApi.postForm('/bbm/checkpoint_voucher', formData);
      console.log('response save ', JSON.stringify(response));
      router.replace('/(protected)/(tabs)');

      setLoading(false);
    } catch (error: any) {
      if (error.response && error.response.data) {
        const msg = error.response.data.message || 'Terjadi kesalahan.';
        Alert.alert('Warning!', msg, [{ text: 'Tutup', style: 'cancel' }]);
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
      className=" bg-slate-300"
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 100}>
      <View className="absolute h-80 w-full rounded-bl-[50] rounded-br-[50]  bg-[#205781]" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="m-4 rounded-lg bg-white p-4">
          {isLoading || isError ? (
            <SkeletonList loop={5} />
          ) : (
            <>
              <View className="mb-3 items-center gap-4 py-2">
                <View className="flex-row items-center text-sm text-gray-500">
                  <View className="flex-grow border-t border-gray-300" />
                  <Text className="mx-2 text-lg font-bold text-[#205781]">Pengisian BBM</Text>
                  <View className="flex-grow border-t border-gray-300" />
                </View>
                <Text className="text-center text-5xl font-bold">
                  Voucher : {data?.liter} Liter Pertamax
                </Text>
                <Text className="text-center text-sm font-bold">
                  Silahkan foto kondisi terkini saat melakukan proses pengisian BBM Kendaraan
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
                      <Image
                        source={{ uri: uriLokasi }}
                        className="aspect-[3/4] w-full rounded-lg"
                      />
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
                      <Image
                        source={{ uri: uriStruck }}
                        className="aspect-[3/4] w-full rounded-lg"
                      />
                      <ButtonCloseImage onPress={() => setUriStruck(null)} loading={loading} />
                    </View>
                  )}
                </View>
                <ButtonCostum
                  classname={colors.secondary}
                  title="Simpan Pengisian BBM"
                  loading={loading}
                  onPress={handleSubmitProsesBBM}
                />
              </View>
            </>
          )}
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
