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
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import Input from '@/components/Input';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import ModalCamera from '@/components/ModalCamera';
import secureApi from '@/services/service';
import { Formik, FormikValues } from 'formik';
import * as yup from 'yup';
import { colors } from '@/constants/colors';
import { reLocation } from '@/hooks/locationRequired';
import { useLoadingStore } from '@/stores/loadingStore';

import { stopTracking } from '@/utils/locationUtils';

import { useLocationStore } from '@/stores/locationStore';
import { useQuery } from '@tanstack/react-query';
import SkeletonList from '@/components/SkeletonList';
import { dataDetail } from '@/types/types';
import * as SecureStore from 'expo-secure-store';
import { getStoredCoords } from '@/lib/secureStorage';
import { Toast } from 'toastify-react-native';
import HandleError from '@/utils/handleError';

const validationSchema = yup.object().shape({
  spidometer: yup.number().required('Spidometer harus diisi'),
});

const fetchData = async (reservasi_id: string) => {
  const response = await secureApi.get(`/reservasi/cek_data_aktif`, {
    params: {
      reservasi_id: reservasi_id,
    },
  });
  return response.data;
};

export default function PengembalianScreen() {
  const { reservasi_id } = useLocalSearchParams();
  const { clearCoordinates } = useLocationStore();

  const { data, isLoading, error, isError } = useQuery<dataDetail>({
    queryKey: ['pengembalian', reservasi_id],
    queryFn: () => fetchData(reservasi_id.toString()),
  });

  if (isError) {
    Alert.alert('Peringatan!', 'Data tidak valid atau kendaraan tidak aktif!', [
      { text: 'Kembali', onPress: () => router.back() },
    ]);
  }

  const setLoading = useLoadingStore((state) => state.setLoading);

  const [modalVisible, setModalVisible] = useState(false);

  const [uri, setUri] = useState<string | null>(null);

  const handleSubmitExit = async (values: FormikValues) => {
    setLoading(true);
    if (!uri && values.spidometer == '') {
      Toast.error('Foto spidometer belum di ambil');
      setLoading(false);
      return;
    }

    const coordinate = await reLocation.getCoordinate();

    if (!coordinate?.lat && coordinate?.long) {
      Alert.alert('Peringatan!', 'Error device location', [{ text: 'Tutup', onPress: () => null }]);
      setLoading(false);
      return;
    }
    const asyncCoords = await getStoredCoords();

    try {
      const formData = new FormData();
      formData.append('latitude', coordinate?.lat?.toString() || '');
      formData.append('longitude', coordinate?.long.toString() || '');
      formData.append('spidometer', values.spidometer);
      formData.append('reservasi_id', reservasi_id.toString());
      formData.append('coordinates', JSON.stringify(asyncCoords));
      formData.append('fileImage', {
        uri: uri,
        name: 'spidometer-capture.jpg',
        type: 'image/jpeg',
      } as any);

      // console.log('formData', formData);

      await secureApi.postForm('/reservasi/return_kendaraan', formData);
      clearCoordinates();
      await stopTracking();
      // console.log('response ', JSON.stringify(response.data));

      await SecureStore.deleteItemAsync('DataAktif');
      // console.log(response.message);
      router.replace('(tabs)');
    } catch (error: any) {
      HandleError(error);
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
              <Text className="text-center"> Silahkan foto spidometer kendaraan yang terbaru</Text>
              <Formik
                initialValues={{ spidometer: '' }}
                validationSchema={validationSchema}
                onSubmit={async (values) => await handleSubmitExit(values)}>
                {({ handleChange, handleSubmit, values, errors, touched }) => (
                  <>
                    {touched.spidometer && errors.spidometer && (
                      <View className="my-4 rounded-lg bg-red-400 p-4">
                        <Text className="text-white">
                          Foto dan Spidometer wajib di ambil dan isi
                        </Text>
                      </View>
                    )}
                    {!uri ? (
                      <TouchableOpacity
                        className="my-3 flex-row items-center justify-center rounded-lg bg-indigo-500 px-3 py-1"
                        onPress={() => setModalVisible(true)}>
                        <AntDesign name="camera" size={32} />
                        <Text className="ms-2 font-bold text-white">Open Camera</Text>
                      </TouchableOpacity>
                    ) : (
                      <>
                        <View className="my-4 w-full rounded-lg bg-black">
                          <Image
                            source={{ uri: uri || undefined }}
                            className="aspect-[3/4] w-full rounded-lg"
                          />
                          <TouchableOpacity
                            className="absolute right-1 top-1 rounded-full bg-white p-1"
                            onPress={() => {
                              setUri(null);
                              values.spidometer = '';
                            }}>
                            <AntDesign name="closecircleo" size={32} color="red" />
                          </TouchableOpacity>
                        </View>
                        <Input
                          className="bg-gray-200"
                          label="Spidometer"
                          placeholder="Angka spidometer"
                          inputMode={'numeric'}
                          value={values.spidometer}
                          error={touched.spidometer ? errors.spidometer : undefined}
                          onChangeText={handleChange('spidometer')}
                        />
                      </>
                    )}
                    <TouchableOpacity
                      className={`my-2 flex-row items-center justify-center gap-2 rounded-lg p-3 ${colors.secondary}`}
                      onPress={() => handleSubmit()}>
                      <Text className="font-bold text-white">Kembaliankan Kendaraan</Text>
                      <MaterialCommunityIcons name="car" size={22} color="white" />
                    </TouchableOpacity>
                  </>
                )}
              </Formik>
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
