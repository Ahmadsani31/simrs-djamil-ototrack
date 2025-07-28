import {
  Alert,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import Input from '@/components/Input';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import ModalCamera from '@/components/ModalCamera';
import SafeAreaView from '@/components/SafeAreaView';
import secureApi from '@/services/service';
import { Formik, FormikValues } from 'formik';
import * as yup from 'yup';
import { colors } from '@/constants/colors';
import { reLocation } from '@/hooks/locationRequired';
import { useLoadingStore } from '@/stores/loadingStore';
import CustomHeader from '@/components/CustomHeader';

import { stopTracking } from '@/utils/locationUtils';

import { useLocationStore } from '@/stores/locationStore';
import { useQuery } from '@tanstack/react-query';
import SkeletonList from '@/components/SkeletonList';
import * as SecureStore from 'expo-secure-store';
import { getStoredCoords } from '@/lib/secureStorage';
import { Toast } from 'toastify-react-native';
import CustomNumberInput from '@/components/CustomNumberInput';
import InputArea from '@/components/InputArea';

type propsService = {
  id: string;
  name: string;
  no_polisi: string;
  keterangan: string;
  jenis_kerusakan: string;
  lokasi: string;
};

const fetchData = async (service_id: string) => {
  const response = await secureApi.get(`/service/data_aktif`, {
    params: {
      service_id: service_id,
    },
  });
  // console.log(`fetchData response`, response.data);

  return response.data;
};

export default function PengembalianServiceScreen() {
  const { service_id, kendaraan_id } = useLocalSearchParams();

  const { data, isLoading, error, isError } = useQuery<propsService>({
    queryKey: ['pengembalian', service_id],
    queryFn: () => fetchData(service_id.toString()),
  });

  if (isError) {
    Alert.alert('Peringatan!', 'Tidak ada pemiliharaan kendaraan yang aktif!', [
      { text: 'Kembali', onPress: () => router.back() },
    ]);
  }

  const setLoading = useLoadingStore((state) => state.setLoading);

  const [modalVisible, setModalVisible] = useState(false);

  const [nominal, setNominal] = useState<string>('');
  const [keterangan, setKeterangan] = useState<string>('');

  const [uri, setUri] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    if (!nominal || nominal === '') {
      Toast.error('Nominal wajib di isi');
      setLoading(false);
      return;
    }
    if (!uri) {
      Toast.error('Foto struk / bon belum di ambil');
      setLoading(false);
      return;
    }

    const coordinate = await reLocation.getCoordinate();

    if (!coordinate?.lat && coordinate?.long) {
      Alert.alert('Peringatan!', 'Error device location', [{ text: 'Tutup', onPress: () => null }]);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('latitude', coordinate?.lat?.toString() || '');
      formData.append('longitude', coordinate?.long.toString() || '');
      formData.append('service_id', service_id.toString());
      formData.append('kendaraan_id', kendaraan_id.toString());
      formData.append('nominal', nominal);
      formData.append('keterangan', keterangan);
      formData.append('fileImage', {
        uri: uri,
        name: 'bon-capture.jpg',
        type: 'image/jpeg',
      } as any);

      // console.log('formData', formData);
      // return;

      await secureApi.postForm('/service/update', formData);
      // console.log('response ', JSON.stringify(response.data));

      // await SecureStore.deleteItemAsync('DataAktif');
      // console.log(response.message);
      router.replace('(tabs)');
    } catch (error: any) {
      // console.log(error.response);
      if (error.response && error.response.data) {
        const msg = error.response.data.message || 'Terjadi kesalahan.';
        Toast.error(msg);
      } else if (error.request) {
        Alert.alert('Network Error', 'Tidak bisa terhubung ke server. Cek koneksi kamu.');
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
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
                  <Text className="mx-2 text-lg text-[#205781]">Proses Pengembalian Kendaraan</Text>
                  <View className="flex-grow border-t border-gray-300" />
                </View>
                <View>
                  <Text className="text-center text-5xl font-bold">{data?.name}</Text>
                  <Text className="mt-3 text-center font-medium">{data?.no_polisi}</Text>
                </View>
              </View>
              <View className="mb-4 w-full border border-b-2" />
              <Text className="mb-3 text-center">
                {' '}
                Silahkan foto spidometer kendaraan yang terbaru
              </Text>

              <CustomNumberInput
                className="bg-gray-100"
                placeholder="Masukan nominal"
                label="Uang"
                onFormattedValue={(raw, formatted) => {
                  setNominal(raw);
                  // console.log('Raw:', raw);
                  // console.log('Formatted:', formatted);
                }}
              />
              <Text className="text-center text-sm text-gray-500">
                Ambil foto struk / bon pengisian BBM
              </Text>
              {!uri ? (
                <TouchableOpacity
                  className="my-3 flex-row items-center rounded-lg bg-indigo-500 px-3 py-1"
                  onPress={() => setModalVisible(true)}>
                  <AntDesign name="camera" size={32} color={'white'} />
                  <Text className="ms-2 font-bold text-white">Open Camera</Text>
                </TouchableOpacity>
              ) : (
                <View className="my-4 w-full rounded-lg bg-black">
                  <Image
                    source={{ uri: uri || undefined }}
                    className="aspect-[3/4] w-full rounded-lg"
                  />
                  <TouchableOpacity
                    className="absolute right-1 top-1 rounded-full bg-white p-1"
                    onPress={() => {
                      setUri(null);
                    }}>
                    <AntDesign name="closecircleo" size={32} color="red" />
                  </TouchableOpacity>
                </View>
              )}
              <InputArea
                className="bg-gray-50"
                label="Keterangan"
                placeholder="Keterangan pengembalian (opsional)"
                value={keterangan}
                onChangeText={(e) => setKeterangan(e)}
              />
              <TouchableOpacity
                className={`my-2 flex-row items-center justify-center gap-2 rounded-lg p-3 ${colors.secondary}`}
                onPress={() => handleSubmit()}>
                <Text className="font-bold text-white">Pemiliharaan Selesai</Text>
                <MaterialCommunityIcons name="car" size={22} color="white" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
      <ModalCamera
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        setUriImage={(e) => setUri(e)}
      />
    </KeyboardAvoidingView>
  );
}
