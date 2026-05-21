import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
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
import SubmitOverlay from '@/components/feedback/SubmitOverlay';
import CustomNumberInput from '@/components/forms/CustomNumberInput';
import PhotoCaptureField from '@/components/forms/PhotoCaptureField';
import ModalCamera from '@/components/modals/ModalCamera';
import ModalPreviewImage from '@/components/modals/ModalPreviewImage';
import VehicleHeaderCard from '@/components/sections/VehicleHeaderCard';
import KeyboardAwareScreen from '@/components/layout/KeyboardAwareScreen';
import { reLocation } from '@/hooks/locationRequired';
import { getCoordsForUpload } from '@/lib/secureStorage';
import secureApi from '@/services/service';
import { useLocationStore } from '@/stores/locationStore';
import { dataDetail } from '@/types/types';
import HandleError from '@/utils/handleError';
import { stopTracking } from '@/utils/locationUtils';

type FormValues = {
  spidometer: string;
  fileImage: string;
};

const validationSchema = yup.object().shape({
  spidometer: yup.number().typeError('Harus angka').required('Spidometer harus diisi'),
  fileImage: yup.string().required('Foto spidometer akhir harus diambil'),
});

const fetchData = async (reservasi_id: string) => {
  const response = await secureApi.get(`/reservasi/cek_data_aktif`, {
    params: {
      reservasi_id,
    },
  });
  return response.data;
};

export default function PengembalianScreen() {
  const { reservasi_id } = useLocalSearchParams();
  const { clearCoordinates } = useLocationStore();

  const [cameraVisible, setCameraVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery<dataDetail>({
    queryKey: ['pengembalian', reservasi_id],
    queryFn: () => fetchData(reservasi_id.toString()),
  });

  if (isError) {
    Alert.alert('Peringatan!', 'Data tidak valid atau kendaraan tidak aktif!', [
      { text: 'Kembali', onPress: () => router.back() },
    ]);
    return null;
  }

  const handleSubmitExit = async (values: FormValues) => {
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
      const asyncCoords = await getCoordsForUpload();

      const formData = new FormData();
      formData.append('latitude', coordinate.lat.toString());
      formData.append('longitude', coordinate.long.toString());
      formData.append('spidometer', values.spidometer);
      formData.append('reservasi_id', reservasi_id.toString());
      formData.append('coordinates', JSON.stringify(asyncCoords));
      formData.append('fileImage', {
        uri: values.fileImage,
        name: 'spidometer-capture.jpg',
        type: 'image/jpeg',
      } as any);

      await secureApi.postForm('/reservasi/return_kendaraan', formData);
      clearCoordinates();
      await stopTracking();
      await SecureStore.deleteItemAsync('DataAktif');
      router.dismissTo('/(protected)/(tabs)');
    } catch (error: unknown) {
      HandleError(error);
    } finally {
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {isLoading ? (
        <View className="m-4 rounded-2xl bg-white p-4 shadow-sm">
          <SkeletonList loop={5} />
        </View>
      ) : (
        <Formik<FormValues>
          initialValues={{ spidometer: '', fileImage: '' }}
          validationSchema={validationSchema}
          onSubmit={async (values) => await handleSubmitExit(values)}>
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
                  variant="pengembalian"
                  label="Pengembalian Kendaraan"
                  name={data?.name}
                  noPolisi={data?.no_polisi}
                />

                {/* Tracking stop notice */}
                <View className="mx-4 mb-3 flex-row items-start gap-2 rounded-xl bg-sky-50 p-3">
                  <View className="rounded-full bg-sky-100 p-1.5">
                    <MaterialCommunityIcons name="check-decagram" size={14} color="#0284c7" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-sky-700">
                      Tracking akan dihentikan setelah kendaraan dikembalikan. Pastikan foto
                      spidometer akhir & angka diisi dengan benar.
                    </Text>
                  </View>
                </View>

                <View className="mx-4 rounded-2xl bg-white p-5 shadow-sm">
                  <View className="mb-4 flex-row items-center gap-2 border-b border-slate-100 pb-3">
                    <Feather name="log-out" size={16} color="#205781" />
                    <Text className="text-base font-bold text-gray-800">Detail Pengembalian</Text>
                  </View>

                  <PhotoCaptureField
                    label="Foto Spidometer Akhir"
                    helper="Foto spidometer kendaraan yang terbaru"
                    value={values.fileImage}
                    onCapture={() => setCameraVisible(true)}
                    onClear={() => {
                      setFieldValue('fileImage', '');
                      setFieldValue('spidometer', '');
                    }}
                    onPreview={() => setPreviewUri(values.fileImage)}
                    error={touched.fileImage ? errors.fileImage : undefined}
                    disabled={isSubmitting}
                  />

                  {values.fileImage ? (
                    <CustomNumberInput
                      className="bg-gray-50"
                      placeholder="Masukan nilai spidometer"
                      label="Nilai Spidometer"
                      value={values.spidometer}
                      error={touched.spidometer ? errors.spidometer : undefined}
                      onFormattedValue={handleChange('spidometer')}
                    />
                  ) : null}

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

              {cameraVisible && (
                <ModalCamera
                  visible={cameraVisible}
                  onClose={() => setCameraVisible(false)}
                  setUriImage={(uri) => {
                    if (uri) setFieldValue('fileImage', uri);
                  }}
                />
              )}

              <SubmitOverlay
                visible={isSubmitting}
                message="Mengembalikan kendaraan..."
                accent="#0ea5e9"
              />
            </>
          )}
        </Formik>
      )}

      {previewUri && (
        <ModalPreviewImage
          title="Foto Spidometer"
          visible={!!previewUri}
          imgUrl={previewUri}
          onPress={() => setPreviewUri(null)}
        />
      )}
    </KeyboardAvoidingView>
  );
}
