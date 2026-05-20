import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { router, useLocalSearchParams } from 'expo-router';
import { Formik, FormikValues } from 'formik';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Toast } from 'toastify-react-native';
import * as yup from 'yup';

import SkeletonList from '@/components/feedback/SkeletonList';
import CustomNumberInput from '@/components/forms/CustomNumberInput';
import InputArea from '@/components/forms/InputArea';
import InputDate from '@/components/forms/InputDate';
import InputFile from '@/components/forms/InputFile';
import VehicleHeaderCard from '@/components/sections/VehicleHeaderCard';
import { reLocation } from '@/hooks/locationRequired';
import secureApi from '@/services/service';
import HandleError from '@/utils/handleError';

type propsService = {
  id: string;
  name: string;
  no_polisi: string;
  keterangan: string;
  jenis_kerusakan: string;
  lokasi: string;
};

const validationSchema = yup.object().shape({
  nominal: yup.number().typeError('Harus angka').required('Biaya pemeliharaan wajib diisi'),
  tanggal: yup.string().required('Tanggal wajib diisi'),
  keterangan: yup.string().required('Keterangan wajib diisi'),
  fileUpload: yup.string().required('Foto bukti wajib diisi'),
});

const fetchData = async (service_id: string, kendaraan_id: string) => {
  const response = await secureApi.get(`/service/data_aktif_admin`, {
    params: {
      service_id,
      kendaraan_id,
    },
  });
  return response.data;
};

export default function PengembalianServiceManualScreen() {
  const { service_id, kendaraan_id } = useLocalSearchParams();

  const { data, isLoading, isError } = useQuery<propsService>({
    queryKey: ['pengembalian', service_id],
    queryFn: () => fetchData(service_id.toString(), kendaraan_id.toString()),
  });

  if (isError) {
    Alert.alert('Peringatan!', 'Tidak ada pemeliharaan kendaraan yang aktif!', [
      { text: 'Kembali', onPress: () => router.back() },
    ]);
  }

  const postSubmitData = async (values: FormikValues) => {
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
      formData.append('service_id', service_id.toString());
      formData.append('kendaraan_id', kendaraan_id.toString());
      formData.append('nominal', values.nominal);
      formData.append('keterangan', values.keterangan);
      formData.append('tanggal', dayjs(values.tanggal).format('YYYY-MM-DD HH:mm:ss'));
      formData.append('fileImage', {
        uri: values.fileUpload,
        name: 'bon-capture.jpg',
        type: 'image/jpeg',
      } as any);

      await secureApi.postForm('/service/update_admin', formData);
      router.dismissTo('(tabs-admin)/pemiliharaan');
    } catch (error: unknown) {
      HandleError(error);
    } finally {
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-100"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
      {isLoading ? (
        <View className="m-4 rounded-2xl bg-white p-4 shadow-sm">
          <SkeletonList loop={5} />
        </View>
      ) : (
        <Formik
          initialValues={{ nominal: '', keterangan: '', tanggal: '', fileUpload: '' }}
          validationSchema={validationSchema}
          onSubmit={async (values) => await postSubmitData(values)}>
          {({
            handleChange,
            handleSubmit,
            setFieldValue,
            values,
            touched,
            errors,
            isSubmitting,
          }) => (
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <VehicleHeaderCard
                variant="pemeliharaan"
                label="Selesai Pemeliharaan (Admin)"
                name={data?.name}
                noPolisi={data?.no_polisi}
                subtitle={data?.jenis_kerusakan}
              />

              {data?.lokasi || data?.keterangan ? (
                <View className="mx-4 mb-3 rounded-xl bg-white p-3 shadow-sm">
                  {data?.lokasi ? (
                    <View className="mb-1 flex-row items-start gap-2">
                      <Feather name="map-pin" size={12} color="#64748b" />
                      <Text className="flex-1 text-xs text-gray-600">{data.lokasi}</Text>
                    </View>
                  ) : null}
                  {data?.keterangan ? (
                    <View className="flex-row items-start gap-2">
                      <Feather name="message-square" size={12} color="#64748b" />
                      <Text className="flex-1 text-xs text-gray-600">{data.keterangan}</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              <View className="mx-4 mb-3 flex-row items-start gap-2 rounded-xl bg-amber-50 p-3">
                <View className="rounded-full bg-amber-100 p-1.5">
                  <Feather name="shield" size={14} color="#d97706" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-amber-700">Mode Admin</Text>
                  <Text className="mt-0.5 text-[11px] text-amber-600/80">
                    Selesaikan pemeliharaan secara manual jika driver tidak dapat menyelesaikan
                    sendiri.
                  </Text>
                </View>
              </View>

              <View className="mx-4 rounded-2xl bg-white p-5 shadow-sm">
                <View className="mb-4 flex-row items-center gap-2 border-b border-slate-100 pb-3">
                  <MaterialCommunityIcons name="receipt" size={16} color="#205781" />
                  <Text className="text-base font-bold text-gray-800">Detail Penyelesaian</Text>
                </View>

                <CustomNumberInput
                  className="bg-gray-50"
                  placeholder="Masukan nominal"
                  label="Biaya Pemeliharaan (Rp)"
                  value={values.nominal}
                  error={touched.nominal ? errors.nominal : undefined}
                  onFormattedValue={handleChange('nominal')}
                />
                <InputDate
                  label="Tanggal Penyelesaian"
                  onChangeDate={(e) => setFieldValue('tanggal', e)}
                  onResetDate={() => setFieldValue('tanggal', '')}
                  value={values.tanggal}
                  error={touched.tanggal ? errors.tanggal : undefined}
                />
                <InputFile
                  label="Upload Foto Bukti / Struk"
                  onChangeFile={(e) => setFieldValue('fileUpload', e)}
                  placeholder="Pilih file dari galeri"
                  error={touched.fileUpload ? errors.fileUpload : undefined}
                />
                <InputArea
                  className="bg-gray-50"
                  label="Keterangan"
                  placeholder="Catatan tambahan tentang pemeliharaan"
                  value={values.keterangan}
                  onChangeText={handleChange('keterangan')}
                  error={touched.keterangan ? errors.keterangan : undefined}
                />

                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={isSubmitting}
                  onPress={() => handleSubmit()}
                  className={`mt-3 flex-row items-center justify-center gap-2 rounded-xl py-3.5 ${
                    isSubmitting ? 'bg-amber-300' : 'bg-amber-500'
                  }`}>
                  <MaterialCommunityIcons name="check-circle" size={18} color="white" />
                  <Text className="text-base font-bold text-white">
                    {isSubmitting ? 'Memproses...' : 'Selesaikan Pemeliharaan'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </Formik>
      )}
    </KeyboardAvoidingView>
  );
}
