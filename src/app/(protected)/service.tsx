import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Toast } from 'toastify-react-native';
import * as yup from 'yup';

import SkeletonList from '@/components/feedback/SkeletonList';
import CustomNumberInput from '@/components/forms/CustomNumberInput';
import Input from '@/components/forms/Input';
import InputArea from '@/components/forms/InputArea';
import VehicleHeaderCard from '@/components/sections/VehicleHeaderCard';
import KeyboardAwareScreen from '@/components/layout/KeyboardAwareScreen';
import { reLocation } from '@/hooks/locationRequired';
import secureApi from '@/services/service';
import { dataDetail } from '@/types/types';
import HandleError from '@/utils/handleError';

type FormValues = {
  jenis_kerusakan: string;
  lokasi: string;
  spidometer: string;
  keterangan: string;
};

const validationSchema = yup.object().shape({
  jenis_kerusakan: yup.string().required('Jenis Kerusakan harus diisi'),
  lokasi: yup.string().required('Lokasi / alamat pemeliharaan harus diisi'),
  spidometer: yup.number().typeError('Harus angka').required('Nilai spidometer harus diisi'),
  keterangan: yup.string().required('Keterangan harus diisi'),
});

const fetchData = async (uuid: string) => {
  const response = await secureApi.get(`/reservasi/detail?uniqued_id=${uuid}`);
  return response.data;
};

const JENIS_KERUSAKAN = [
  { label: 'Service Rutin', value: 'Service Rutin', icon: 'tools' },
  { label: 'Service Radiator', value: 'Service Radiator', icon: 'water-pump' },
  { label: 'Ganti Sparepart', value: 'Ganti Sparepart', icon: 'cog-sync' },
  { label: 'Ganti Oli', value: 'Ganti Oli', icon: 'oil' },
  { label: 'Ganti Aki', value: 'Ganti Aki', icon: 'car-battery' },
  { label: 'Ganti Ban', value: 'Ganti Ban', icon: 'tire' },
  { label: 'Tune Up Mesin', value: 'Tune Up Mesin', icon: 'engine' },
  { label: 'Ganti Kaca Film', value: 'Ganti Kaca Film', icon: 'car-windshield' },
  { label: 'Lain-lainnya', value: 'Lain-lainnya', icon: 'dots-horizontal' },
] as const;

export default function ServiceScreen() {
  const { uuid } = useLocalSearchParams();

  const [pickerVisible, setPickerVisible] = useState(false);

  const { data, isLoading, isError } = useQuery<dataDetail>({
    queryKey: ['dataDetail', uuid],
    queryFn: () => fetchData(uuid.toString()),
  });

  if (isError) {
    Alert.alert('Peringatan!', 'Kendaraan tidak aktif atau kendaraan tidak ada!', [
      { text: 'Kembali', onPress: () => router.back() },
    ]);
  }

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Batalkan?',
        'Apakah kamu yakin ingin membatalkan proses pemeliharaan kendaraan?',
        [
          { text: 'Tidak', style: 'cancel' },
          { text: 'Ya, Batalkan', onPress: () => router.back(), style: 'destructive' },
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const handleSubmitDetail = async (values: FormValues) => {
    const coordinate = await reLocation.getCoordinate();
    if (!coordinate?.lat || !coordinate?.long) {
      Toast.show({
        type: 'error',
        text1: 'Lokasi tidak terdeteksi',
        text2: 'Aktifkan GPS dan coba lagi.',
      });
      return;
    }
    try {
      const formData = new FormData();
      formData.append('latitude', coordinate.lat.toString());
      formData.append('longitude', coordinate.long.toString());
      formData.append('keterangan', values.keterangan);
      formData.append('jenis_kerusakan', values.jenis_kerusakan);
      formData.append('lokasi', values.lokasi);
      formData.append('spidometer', values.spidometer);
      formData.append('kendaraan_id', data?.id || '');

      await secureApi.postForm('/service/store', formData);
      router.dismissTo('/(protected)/(tabs)/(pemiliharaan)');
    } catch (error: unknown) {
      HandleError(error);
    } finally {
    }
  };

  return (
    <KeyboardAwareScreen className="flex-1 bg-slate-100">
      {isLoading ? (
        <View className="m-4 rounded-2xl bg-white p-4 shadow-sm">
          <SkeletonList loop={6} />
        </View>
      ) : (
        <Formik<FormValues>
          initialValues={{ jenis_kerusakan: '', lokasi: '', spidometer: '', keterangan: '' }}
          validationSchema={validationSchema}
          onSubmit={async (values) => await handleSubmitDetail(values)}>
          {({
            handleChange,
            handleSubmit,
            setFieldValue,
            values,
            errors,
            touched,
            isSubmitting,
          }) => (
            <>
              <ScrollView
                contentContainerStyle={{ paddingBottom: 24 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                <VehicleHeaderCard
                  variant="pemeliharaan"
                  label="Mulai Pemeliharaan"
                  name={data?.name}
                  noPolisi={data?.no_polisi}
                />

                <View className="mx-4 mb-3 flex-row items-start gap-2 rounded-xl bg-amber-50 p-3">
                  <View className="rounded-full bg-amber-100 p-1.5">
                    <MaterialCommunityIcons name="wrench" size={14} color="#d97706" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-amber-700">Pemeliharaan Aktif</Text>
                    <Text className="mt-0.5 text-[11px] text-amber-600/80">
                      Setelah simpan, kendaraan akan masuk daftar pemeliharaan aktif sampai proses
                      selesai dilakukan.
                    </Text>
                  </View>
                </View>

                <View className="mx-4 rounded-2xl bg-white p-5 shadow-sm">
                  <View className="mb-4 flex-row items-center gap-2 border-b border-slate-100 pb-3">
                    <Feather name="edit-3" size={16} color="#205781" />
                    <Text className="text-base font-bold text-gray-800">Detail Pemeliharaan</Text>
                  </View>

                  {/* Jenis Kerusakan picker */}
                  <View className="mb-4">
                    <Text className="mb-1 text-sm font-semibold text-gray-700">
                      Jenis Pemeliharaan
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setPickerVisible(true)}
                      className={`flex-row items-center justify-between rounded-xl border bg-gray-50 px-4 py-3 ${
                        touched.jenis_kerusakan && errors.jenis_kerusakan
                          ? 'border-red-400'
                          : 'border-gray-300'
                      }`}>
                      <View className="flex-1 flex-row items-center gap-2">
                        {values.jenis_kerusakan ? (
                          <MaterialCommunityIcons
                            name={
                              (JENIS_KERUSAKAN.find((j) => j.value === values.jenis_kerusakan)
                                ?.icon ?? 'wrench') as keyof typeof MaterialCommunityIcons.glyphMap
                            }
                            size={16}
                            color="#205781"
                          />
                        ) : null}
                        <Text
                          className={`text-base ${
                            values.jenis_kerusakan ? 'text-gray-800' : 'text-gray-400'
                          }`}>
                          {values.jenis_kerusakan || 'Pilih jenis pemeliharaan'}
                        </Text>
                      </View>
                      <Feather name="chevron-down" size={18} color="#94a3b8" />
                    </TouchableOpacity>
                    {touched.jenis_kerusakan && errors.jenis_kerusakan ? (
                      <Text className="mt-1 text-xs text-red-500">{errors.jenis_kerusakan}</Text>
                    ) : null}
                  </View>

                  <Input
                    label="Lokasi"
                    placeholder="Lokasi / alamat pemeliharaan"
                    value={values.lokasi}
                    onChangeText={handleChange('lokasi')}
                    error={touched.lokasi ? errors.lokasi : undefined}
                    className="bg-gray-50"
                  />
                  <CustomNumberInput
                    className="bg-gray-50"
                    placeholder="Angka spidometer kendaraan"
                    value={values.spidometer}
                    label="Spidometer"
                    error={touched.spidometer ? errors.spidometer : undefined}
                    onFormattedValue={handleChange('spidometer')}
                  />
                  <InputArea
                    className="bg-gray-50"
                    label="Keterangan"
                    placeholder="Detail kerusakan / keterangan tambahan"
                    value={values.keterangan}
                    error={touched.keterangan ? errors.keterangan : undefined}
                    onChangeText={handleChange('keterangan')}
                  />

                  <TouchableOpacity
                    activeOpacity={0.85}
                    disabled={isSubmitting}
                    onPress={() => handleSubmit()}
                    className={`mt-3 flex-row items-center justify-center gap-2 rounded-xl py-3.5 ${
                      isSubmitting ? 'bg-amber-300' : 'bg-amber-500'
                    }`}>
                    <MaterialCommunityIcons name="wrench" size={18} color="white" />
                    <Text className="text-base font-bold text-white">
                      {isSubmitting ? 'Memproses...' : 'Mulai Pemeliharaan'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              {/* Custom picker modal */}
              <Modal
                visible={pickerVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setPickerVisible(false)}>
                <Pressable
                  className="flex-1 justify-end bg-black/50"
                  onPress={() => setPickerVisible(false)}>
                  <Pressable
                    className="overflow-hidden rounded-t-3xl bg-white"
                    onPress={() => undefined}>
                    <View className="flex-row items-center justify-between border-b border-slate-100 px-5 py-4">
                      <Text className="text-base font-bold text-gray-800">
                        Pilih Jenis Pemeliharaan
                      </Text>
                      <TouchableOpacity onPress={() => setPickerVisible(false)} hitSlop={10}>
                        <Feather name="x" size={20} color="#64748b" />
                      </TouchableOpacity>
                    </View>
                    <ScrollView className="max-h-[420px]">
                      {JENIS_KERUSAKAN.map((item) => {
                        const selected = values.jenis_kerusakan === item.value;
                        return (
                          <TouchableOpacity
                            key={item.value}
                            activeOpacity={0.7}
                            onPress={() => {
                              setFieldValue('jenis_kerusakan', item.value);
                              setPickerVisible(false);
                            }}
                            className={`flex-row items-center gap-3 px-5 py-3.5 ${
                              selected ? 'bg-amber-50' : ''
                            }`}>
                            <View
                              className={`rounded-full p-2 ${
                                selected ? 'bg-amber-100' : 'bg-slate-100'
                              }`}>
                              <MaterialCommunityIcons
                                name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                                size={16}
                                color={selected ? '#d97706' : '#64748b'}
                              />
                            </View>
                            <Text
                              className={`flex-1 text-sm ${
                                selected ? 'font-bold text-amber-700' : 'text-gray-700'
                              }`}>
                              {item.label}
                            </Text>
                            {selected ? <Feather name="check" size={18} color="#d97706" /> : null}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </Pressable>
                </Pressable>
              </Modal>
            </>
          )}
        </Formik>
      )}
    </KeyboardAwareScreen>
  );
}
