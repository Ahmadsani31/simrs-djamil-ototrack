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
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import ModalCamera from '@/components/ModalCamera';
import secureApi from '@/services/service';
import { Formik, FormikValues } from 'formik';
import * as yup from 'yup';
import { colors } from '@/constants/colors';
import { reLocation } from '@/hooks/locationRequired';
import { useLoadingStore } from '@/stores/loadingStore';
import { useQuery } from '@tanstack/react-query';
import SkeletonList from '@/components/SkeletonList';
import { Toast } from 'toastify-react-native';
import CustomNumberInput from '@/components/CustomNumberInput';
import InputArea from '@/components/InputArea';
import HandleError from '@/utils/handleError';
import ModalPreviewImage from '@/components/ModalPreviewImage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import InputDate from '@/components/InputDate';
import InputFile from '@/components/InputFile';
import dayjs from 'dayjs';

type propsService = {
  id: string;
  name: string;
  no_polisi: string;
  keterangan: string;
  jenis_kerusakan: string;
  lokasi: string;
};

const fetchData = async (service_id: string, kendaraan_id: string) => {
  const response = await secureApi.get(`/service/data_aktif_admin`, {
    params: {
      service_id: service_id,
      kendaraan_id: kendaraan_id,
    },
  });
  // console.log(`fetchData response`, response.data);

  return response.data;
};

const validationSchema = yup.object().shape({
  nominal: yup.number().required('Uang wajib isi'),
  tanggal: yup.string().required('Tanggal wajib isi'),
  keterangan: yup.string().required('Keterangan wajib isi'),
  fileUpload: yup.string().required('File image wajib diisi (required)'),
});

export default function PengembalianServiceScreen() {
  const { service_id, kendaraan_id } = useLocalSearchParams();

  const insets = useSafeAreaInsets();
  const [modalImageVisible, setModalImageVisible] = useState(false);
  const [imgBase64, setImgBase64] = useState<Base64URLString>();

  const { data, isLoading, error, isError } = useQuery<propsService>({
    queryKey: ['pengembalian', service_id],
    queryFn: () => fetchData(service_id.toString(), kendaraan_id.toString()),
  });

  if (isError) {
    Alert.alert('Peringatan!', 'Tidak ada pemeliharaan kendaraan yang aktif!', [
      { text: 'Kembali', onPress: () => router.back() },
    ]);
  }

  const setLoading = useLoadingStore((state) => state.setLoading);

  const postSubmitData = async (values: FormikValues) => {
    console.log(values);

    setLoading(true);

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
      formData.append('nominal', values.nominal);
      formData.append('keterangan', values.keterangan);
      formData.append('tanggal', dayjs(values.tanggal).format('YYYY-MM-DD HH:mm:ss'));
      formData.append('fileImage', {
        uri: values.fileUpload,
        name: 'bon-capture.jpg',
        type: 'image/jpeg',
      } as any);

      console.log('formData', formData);
      // return;

      await secureApi.postForm('/service/update_admin', formData);
      // console.log('response ', JSON.stringify(response.data));

      // await SecureStore.deleteItemAsync('DataAktif');
      // console.log(response.message);
      router.dismissTo('(tabs-admin)/pemiliharaan');
    } catch (error: any) {
      // console.log(error.response);
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
            <Formik
              initialValues={{ nominal: '', keterangan: '', tanggal: '', fileUpload: '' }}
              validationSchema={validationSchema}
              onSubmit={async (values) => postSubmitData(values)}>
              {({ handleChange, handleSubmit, setFieldValue, values, touched, errors }) => (
                <>
                  <View className="mb-3 items-center gap-4 py-2">
                    <View className="flex-row items-center text-sm text-gray-500">
                      <View className="flex-grow border-t border-gray-300" />
                      <Text className="mx-2 text-lg text-[#205781]">
                        Proses Pengembalian pemeliharaan Kendaraan
                      </Text>
                      <View className="flex-grow border-t border-gray-300" />
                    </View>
                    <View>
                      <Text className="text-center text-5xl font-bold">{data?.name}</Text>
                      <Text className="mt-3 text-center font-medium">{data?.no_polisi}</Text>
                    </View>
                  </View>
                  <View className="mb-4 w-full border border-b-2" />
                  <Text className="mb-3 text-center">
                    Silahkan foto struk atau bon belanja pemeliharaan kendaraan
                  </Text>

                  <CustomNumberInput
                    className="bg-gray-100"
                    placeholder="Masukan nominal"
                    label="Biaya Pemeliharaan"
                    value={values.nominal}
                    error={touched.nominal ? errors.nominal : undefined}
                    onFormattedValue={handleChange('nominal')}
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
                    className="bg-gray-50"
                    label="Keterangan"
                    placeholder="Keterangan pengembalian (opsional)"
                    value={values.keterangan}
                    onChangeText={handleChange('keterangan')}
                    error={touched.keterangan ? errors.keterangan : undefined}
                  />
                  <TouchableOpacity
                    className={`my-2 flex-row items-center justify-center gap-2 rounded-lg p-3 ${colors.secondary}`}
                    onPress={() => handleSubmit()}>
                    <Text className="font-bold text-white">Pemeliharaan Selesai</Text>
                    <MaterialCommunityIcons name="car" size={22} color="white" />
                  </TouchableOpacity>
                </>
              )}
            </Formik>
          )}
        </View>
      </ScrollView>
      {modalImageVisible && (
        <ModalPreviewImage
          title="Gambar Spidometer"
          visible={modalImageVisible}
          imgUrl={imgBase64 || ''}
          onPress={() => setModalImageVisible(false)}
        />
      )}
    </KeyboardAvoidingView>
  );
}
