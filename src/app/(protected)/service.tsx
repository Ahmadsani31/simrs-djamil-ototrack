import {
  Alert,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import Input from '@/components/Input';
import InputArea from '@/components/InputArea';
import ButtonCostum from '@/components/ButtonCostum';
import { AntDesign } from '@expo/vector-icons';
import ModalCamera from '@/components/ModalCamera';
import SafeAreaView from '@/components/SafeAreaView';
import secureApi from '@/services/service';
import { Formik, FormikValues } from 'formik';
import * as yup from 'yup';
import { colors } from '@/constants/colors';
import { reLocation } from '@/hooks/locationRequired';
import { useLoadingStore } from '@/stores/loadingStore';
import { useQuery } from '@tanstack/react-query';
import SkeletonList from '@/components/SkeletonList';
import CustomHeader from '@/components/CustomHeader';

import { startTracking } from '@/utils/locationUtils';
import { dataDetail } from '@/types/types';

const validationSchema = yup.object().shape({
  keterangan: yup.string().required('Keterangan harus diisi'),
  lokasi: yup.string().required('lokasi / alamat pemiliharaan harus diisi'),
  jenis_kerusakan: yup.string().required('Jenis Kerusakan harus diisi'),
});

const fetchData = async (uuid: string) => {
  const response = await secureApi.get(`/reservasi/detail?uniqued_id=${uuid}`);
  return response.data;
};

export default function ServiceScreen() {
  const { uuid } = useLocalSearchParams();

  const setLoading = useLoadingStore((state) => state.setLoading);

  useEffect(() => {
    refetch();
  }, [uuid]);

  const { data, isLoading, error, isError, refetch } = useQuery<dataDetail>({
    queryKey: ['dataDetail', uuid],
    queryFn: () => fetchData(uuid.toString()),
  });

  if (isError) {
    Alert.alert('Peringatan!', 'Kendaraan tidak aktif atau kendaraan tidak ada!', [
      { text: 'Kembali', onPress: () => router.back() },
    ]);
  }

  const backAction = () => {
    Alert.alert('Peringatan!', 'Apakah Kamu yakin ingin membatalkan proses pemakaian kendaraan?', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel',
      },
      { text: 'YES', onPress: () => router.back() },
    ]);
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);

  const handleSubmitDetail = async (values: FormikValues) => {
    setLoading(true);

    const coordinate = await reLocation.getCoordinate();

    if (!coordinate?.lat && coordinate?.long) {
      Alert.alert('Peringatan!', 'Error device location', [{ text: 'Tutup', onPress: () => null }]);
      return;
    }

    const formData = new FormData();
    formData.append('latitude', coordinate?.lat?.toString() || '');
    formData.append('longitude', coordinate?.long.toString() || '');
    formData.append('keterangan', values.keterangan);
    formData.append('jenis_kerusakan', values.jenis_kerusakan);
    formData.append('lokasi', values.lokasi);
    formData.append('kendaraan_id', data?.id || '');

    try {
      // console.log('formData', formData);
      const response = await secureApi.postForm('/service/store', formData);

      console.log('response ', JSON.stringify(response));

      // await SecureStore.setItemAsync('pemakaianAktif', JSON.stringify(response.data));
      // console.log(response.message);
      router.replace('(tabs)');
    } catch (error: any) {
      console.log(error.response.data);

      if (error.response && error.response.data) {
        const msg = error.response.data.message || 'Terjadi kesalahan.';
        Alert.alert('Warning!', msg, [{ text: 'Tutup', style: 'cancel' }]);
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
      className="bg-slate-300"
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
                <View className="flex-row items-center text-gray-500">
                  <View className="flex-grow border-t border-gray-300" />
                  <Text className="mx-2 text-lg text-[#205781]">Pemiliharaan Kendaaraan</Text>
                  <View className="flex-grow border-t border-gray-300" />
                </View>
                <View>
                  <Text className="text-center text-3xl font-bold">{data?.name}</Text>
                  <Text className="text-center font-medium">{data?.no_polisi}</Text>
                </View>
              </View>
              <View className="mb-4 w-full border border-b-2" />
              <Formik
                initialValues={{ jenis_kerusakan: '', keterangan: '', lokasi: '' }}
                validationSchema={validationSchema}
                onSubmit={async (values) => await handleSubmitDetail(values)}>
                {({ handleChange, handleSubmit, values, errors, touched }) => (
                  <>
                    <Input
                      label="Jenis Kerusakan"
                      placeholder="jenis kerusakan"
                      value={values.jenis_kerusakan}
                      onChangeText={handleChange('jenis_kerusakan')}
                      error={touched.jenis_kerusakan ? errors.jenis_kerusakan : undefined}
                      className="bg-gray-50"
                    />
                    <Input
                      label="Lokasi"
                      placeholder="lokasi / alamat pemiliharaan"
                      value={values.lokasi}
                      onChangeText={handleChange('lokasi')}
                      error={touched.lokasi ? errors.lokasi : undefined}
                      className="bg-gray-50"
                    />
                    <InputArea
                      className="bg-gray-50"
                      label="Keterangan"
                      placeholder="keteragan..."
                      value={values.keterangan}
                      error={touched.keterangan ? errors.keterangan : undefined}
                      onChangeText={handleChange('keterangan')}
                    />

                    <ButtonCostum
                      classname={colors.secondary}
                      title="Simpan"
                      onPress={handleSubmit}
                    />
                  </>
                )}
              </Formik>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
