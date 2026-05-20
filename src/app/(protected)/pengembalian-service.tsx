import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Formik } from 'formik';
import { useState } from 'react';
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
import PhotoCaptureField from '@/components/forms/PhotoCaptureField';
import ModalCamera from '@/components/modals/ModalCamera';
import ModalPreviewImage from '@/components/modals/ModalPreviewImage';
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

type FormValues = {
  nominal: string;
  keterangan: string;
  fileImage: string;
};

const validationSchema = yup.object().shape({
  nominal: yup.number().typeError('Harus angka').required('Biaya pemeliharaan wajib diisi'),
  fileImage: yup.string().required('Foto struk / bon harus diambil'),
});

const fetchData = async (service_id: string) => {
  const response = await secureApi.get(`/service/data_aktif`, {
    params: {
      service_id,
    },
  });
  return response.data;
};

export default function PengembalianServiceScreen() {
  const { service_id, kendaraan_id } = useLocalSearchParams();

  const [cameraVisible, setCameraVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery<propsService>({
    queryKey: ['pengembalian', service_id],
    queryFn: () => fetchData(service_id.toString()),
  });

  if (isError) {
    Alert.alert('Peringatan!', 'Tidak ada pemeliharaan kendaraan yang aktif!', [
      { text: 'Kembali', onPress: () => router.back() },
    ]);
  }

  const postSubmitData = async (values: FormValues) => {
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
      formData.append('fileImage', {
        uri: values.fileImage,
        name: 'bon-capture.jpg',
        type: 'image/jpeg',
      } as any);

      await secureApi.postForm('/service/update', formData);
      router.replace('(tabs)/(pemiliharaan)');
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
        <Formik<FormValues>
          initialValues={{ nominal: '', keterangan: '', fileImage: '' }}
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
            <>
              <ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                <VehicleHeaderCard
                  variant="pemeliharaan"
                  label="Selesai Pemeliharaan"
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

                <View className="mx-4 rounded-2xl bg-white p-5 shadow-sm">
                  <View className="mb-4 flex-row items-center gap-2 border-b border-slate-100 pb-3">
                    <MaterialCommunityIcons name="receipt" size={16} color="#205781" />
                    <Text className="text-base font-bold text-gray-800">Detail Biaya</Text>
                  </View>

                  <CustomNumberInput
                    className="bg-gray-50"
                    placeholder="Masukan nominal"
                    label="Biaya Pemeliharaan (Rp)"
                    value={values.nominal}
                    error={touched.nominal ? errors.nominal : undefined}
                    onFormattedValue={handleChange('nominal')}
                  />

                  <PhotoCaptureField
                    label="Foto Struk / Bon Pemeliharaan"
                    helper="Bukti biaya yang dikeluarkan"
                    value={values.fileImage}
                    onCapture={() => setCameraVisible(true)}
                    onClear={() => setFieldValue('fileImage', '')}
                    onPreview={() => setPreviewUri(values.fileImage)}
                    error={touched.fileImage ? errors.fileImage : undefined}
                    disabled={isSubmitting}
                  />

                  <InputArea
                    className="bg-gray-50"
                    label="Keterangan (opsional)"
                    placeholder="Catatan tambahan tentang pemeliharaan"
                    value={values.keterangan}
                    onChangeText={handleChange('keterangan')}
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
                      {isSubmitting ? 'Memproses...' : 'Pemeliharaan Selesai'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              {cameraVisible && (
                <ModalCamera
                  visible={cameraVisible}
                  onClose={() => setCameraVisible(false)}
                  setUriImage={(uri) => {
                    if (uri) setFieldValue('fileImage', uri);
                  }}
                />
              )}
            </>
          )}
        </Formik>
      )}

      {previewUri && (
        <ModalPreviewImage
          title="Foto Struk Pemeliharaan"
          visible={!!previewUri}
          imgUrl={previewUri}
          onPress={() => setPreviewUri(null)}
        />
      )}
    </KeyboardAvoidingView>
  );
}
