import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import secureApi from '@/services/service';
import { Formik, FormikValues } from 'formik';
import * as yup from 'yup';
import { colors } from '@/constants/colors';
import { useLoadingStore } from '@/stores/loadingStore';

import { useQuery } from '@tanstack/react-query';
import SkeletonList from '@/components/SkeletonList';
import { dataDetail } from '@/types/types';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import InputArea from '@/components/InputArea';
import InputDate from '@/components/InputDate';
import InputFile from '@/components/InputFile';
import dayjs from 'dayjs';
import CustomNumberInput from '@/components/CustomNumberInput';
import HandleError from '@/utils/handleError';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const validationSchema = yup.object().shape({
  spidometer: yup.number().required('Spidometer wajib diisi (required)'),
  keterangan: yup.string().required('Keterangan wajib diisi (required)'),
  tanggal: yup.string().required('Tanggal wajib diisi (required)'),
  fileUpload: yup.string().required('File image wajib diisi (required)'),
});

const fetchData = async (reservasi_id: string, user_id: string) => {
  const response = await secureApi.get(`/reservasi/cek_data_aktif_admin`, {
    params: {
      reservasi_id: reservasi_id,
      user_id: user_id,
    },
  });
  return response.data;
};

export default function PengembalianManualScreen() {
  const { reservasi_id, user_id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { data, isLoading, error, isError } = useQuery<dataDetail>({
    queryKey: ['dataPengembalian', reservasi_id, user_id],
    queryFn: () => fetchData(reservasi_id.toString(), user_id.toString()),
  });

  if (isError) {
    Alert.alert('Peringatan!', 'Data tidak valid atau kendaraan tidak aktif!', [
      { text: 'Kembali', onPress: () => router.back() },
    ]);
  }

  const setLoading = useLoadingStore((state) => state.setLoading);

  const handlePengembalian = async (values: FormikValues) => {
    setLoading(true);
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

      // console.log('formData', formData);
      // return;
      await secureApi.postForm('/reservasi/pengembalian_manual', formData);
      // console.log('response ', JSON.stringify(response.data));

      // await SecureStore.deleteItemAsync('pemakaianAktif');
      // console.log(response.message);
      router.dismissTo('(tabs-admin)');
    } catch (error: any) {
      // console.log(JSON.stringify(error));
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : insets.bottom}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="absolute h-80 w-full rounded-bl-[50] rounded-br-[50]  bg-[#205781]" />
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
                <Text className="text-center text-5xl font-bold">{data?.name}</Text>
                <Text className="mt-3 text-center font-medium">{data?.no_polisi}</Text>
              </View>
              <View className="mb-4 w-full border border-b-2" />
              <Formik
                initialValues={{ spidometer: '', keterangan: '', tanggal: '', fileUpload: '' }}
                validationSchema={validationSchema}
                onSubmit={async (values) => handlePengembalian(values)}>
                {({ handleChange, handleSubmit, setFieldValue, values, errors, touched }) => (
                  <>
                    <CustomNumberInput
                      className="bg-gray-100"
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
                      label="Upload file"
                      onChangeFile={(e) => setFieldValue('fileUpload', e)}
                      placeholder={'Chose file'}
                      error={touched.fileUpload ? errors.fileUpload : undefined}
                    />

                    <InputArea
                      className="bg-gray-200"
                      label="Keterangan"
                      placeholder="Keterangan pengembalian manual"
                      value={values.keterangan}
                      error={touched.keterangan ? errors.keterangan : undefined}
                      onChangeText={handleChange('keterangan')}
                    />
                    <TouchableOpacity
                      className={`my-2 flex-row items-center justify-center gap-2 rounded-lg p-3 ${colors.secondary}`}
                      onPress={() => handleSubmit()}>
                      <Text className="font-bold text-white">Pengembalian Kendaraan Manual</Text>
                      <MaterialCommunityIcons name="car" size={22} color="white" />
                    </TouchableOpacity>
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
