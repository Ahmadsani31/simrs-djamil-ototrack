import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { router, useLocalSearchParams } from 'expo-router';
import { Formik } from 'formik';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as yup from 'yup';

import SkeletonList from '@/components/feedback/SkeletonList';
import CustomNumberInput from '@/components/forms/CustomNumberInput';
import InputArea from '@/components/forms/InputArea';
import InputDate from '@/components/forms/InputDate';
import InputFile from '@/components/forms/InputFile';
import VehicleHeaderCard from '@/components/sections/VehicleHeaderCard';
import KeyboardAwareScreen from '@/components/layout/KeyboardAwareScreen';
import secureApi from '@/services/service';
import { dataDetail } from '@/types/types';
import HandleError from '@/utils/handleError';

type FormValues = {
  spidometer: string;
  keterangan: string;
  tanggal: string | Date;
  fileUpload: string;
};

const validationSchema = yup.object().shape({
  spidometer: yup.number().typeError('Harus angka').required('Spidometer wajib diisi'),
  keterangan: yup.string().required('Keterangan wajib diisi'),
  tanggal: yup.string().required('Tanggal wajib diisi'),
  fileUpload: yup.string().required('Foto bukti wajib diisi'),
});

const fetchData = async (reservasi_id: string, user_id: string) => {
  const response = await secureApi.get(`/reservasi/cek_data_aktif_admin`, {
    params: {
      reservasi_id,
      user_id,
    },
  });
  return response.data;
};

export default function PengembalianManualScreen() {
  const { reservasi_id, user_id } = useLocalSearchParams();

  const { data, isLoading, isError } = useQuery<dataDetail>({
    queryKey: ['dataPengembalian', reservasi_id, user_id],
    queryFn: () => fetchData(reservasi_id.toString(), user_id.toString()),
  });

  if (isError) {
    Alert.alert('Peringatan!', 'Data tidak valid atau kendaraan tidak aktif!', [
      { text: 'Kembali', onPress: () => router.back() },
    ]);
  }

  const handlePengembalian = async (values: FormValues) => {
    try {
      const formData = new FormData();
      formData.append('id', reservasi_id.toString());
      formData.append('spidometer_out', values.spidometer);
      formData.append('reservasi_out', dayjs(values.tanggal).format('YYYY-MM-DD HH:mm:ss'));
      formData.append('keterangan_pengembalian', values.keterangan);
      formData.append('check_pegembalian_manual', '1');
      formData.append('spidometer_file_out', {
        uri: values.fileUpload,
        name: 'spidometer-capture.jpg',
        type: 'image/jpeg',
      } as any);

      await secureApi.postForm('/reservasi/pengembalian_manual', formData);
      router.dismissTo('(tabs-admin)');
    } catch (error: unknown) {
      HandleError(error);
    } finally {
    }
  };

  return (
    <KeyboardAwareScreen className="flex-1 bg-slate-100">
      {isLoading ? (
        <View className="m-4 rounded-2xl bg-white p-4 shadow-sm">
          <SkeletonList loop={5} />
        </View>
      ) : (
        <Formik<FormValues>
          initialValues={{ spidometer: '', keterangan: '', tanggal: '', fileUpload: '' }}
          validationSchema={validationSchema}
          onSubmit={async (values) => await handlePengembalian(values)}>
          {({
            handleChange,
            handleSubmit,
            setFieldValue,
            values,
            errors,
            touched,
            isSubmitting,
          }) => (
            <ScrollView
              contentContainerStyle={{ paddingBottom: 24 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <VehicleHeaderCard
                variant="pengembalian"
                label="Pengembalian Manual (Admin)"
                name={data?.name}
                noPolisi={data?.no_polisi}
              />

              <View className="mx-4 mb-3 flex-row items-start gap-2 rounded-xl bg-amber-50 p-3">
                <View className="rounded-full bg-amber-100 p-1.5">
                  <Feather name="shield" size={14} color="#d97706" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-amber-700">Mode Admin</Text>
                  <Text className="mt-0.5 text-[11px] text-amber-600/80">
                    Pengembalian manual digunakan saat driver tidak dapat mengembalikan kendaraan
                    sendiri. Isi semua field dengan teliti.
                  </Text>
                </View>
              </View>

              <View className="mx-4 rounded-2xl bg-white p-5 shadow-sm">
                <View className="mb-4 flex-row items-center gap-2 border-b border-slate-100 pb-3">
                  <Feather name="edit-3" size={16} color="#205781" />
                  <Text className="text-base font-bold text-gray-800">Detail Pengembalian</Text>
                </View>

                <CustomNumberInput
                  className="bg-gray-50"
                  placeholder="Angka spidometer kendaraan"
                  value={values.spidometer}
                  label="Spidometer"
                  error={touched.spidometer ? errors.spidometer : undefined}
                  onFormattedValue={handleChange('spidometer')}
                />
                <InputDate
                  label="Waktu Pengembalian"
                  onChangeDate={(e) => setFieldValue('tanggal', e)}
                  onResetDate={() => setFieldValue('tanggal', '')}
                  value={values.tanggal}
                  error={touched.tanggal ? errors.tanggal : undefined}
                />
                <InputFile
                  label="Upload Foto Bukti"
                  onChangeFile={(e) => setFieldValue('fileUpload', e)}
                  placeholder="Pilih file dari galeri"
                  error={touched.fileUpload ? errors.fileUpload : undefined}
                />
                <InputArea
                  className="bg-gray-50"
                  label="Keterangan"
                  placeholder="Alasan pengembalian manual"
                  value={values.keterangan}
                  error={touched.keterangan ? errors.keterangan : undefined}
                  onChangeText={handleChange('keterangan')}
                />

                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={isSubmitting}
                  onPress={() => handleSubmit()}
                  className={`mt-3 flex-row items-center justify-center gap-2 rounded-xl py-3.5 ${
                    isSubmitting ? 'bg-sky-300' : 'bg-sky-500'
                  }`}>
                  <MaterialCommunityIcons name="car-arrow-right" size={18} color="white" />
                  <Text className="text-base font-bold text-white">
                    {isSubmitting ? 'Memproses...' : 'Kembalikan Kendaraan'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </Formik>
      )}
    </KeyboardAwareScreen>
  );
}
