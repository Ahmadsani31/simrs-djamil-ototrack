import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
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
import { useLoadingStore } from '@/stores/loadingStore';
import { useLocationStore } from '@/stores/locationStore';
import { dataDetail } from '@/types/types';
import HandleError from '@/utils/handleError';
import { startTracking, stopTracking } from '@/utils/locationUtils';

type FormValues = {
  kegiatan: string;
  spidometer: string;
  fileImage: string;
};

const validationSchema = yup.object().shape({
  kegiatan: yup.string().required('Kegiatan harus diisi'),
  spidometer: yup.number().typeError('Harus angka').required('Spidometer harus diisi'),
  fileImage: yup.string().required('Foto spidometer awal harus diambil'),
});

const fetchData = async (uuid: string) => {
  const response = await secureApi.get(`/reservasi/detail?uniqued_id=${uuid}`);
  return response.data;
};

export default function DetailScreen() {
  const { uuid } = useLocalSearchParams();
  const { clearCoordinates } = useLocationStore();
  const setLoading = useLoadingStore((state) => state.setLoading);

  const [cameraVisible, setCameraVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  // Saat masuk halaman pemakaian baru: bersihkan tracking lama (route koordinat
  // sebelumnya) supaya pemakaian baru dimulai dari state bersih. Refetch tidak
  // diperlukan: react-query otomatis fetch karena `uuid` ada di queryKey.
  useEffect(() => {
    const reset = async () => {
      clearCoordinates();
      await stopTracking();
    };
    reset();
  }, [uuid, clearCoordinates]);

  const { data, isLoading, isError } = useQuery<dataDetail>({
    queryKey: ['dataDetail', uuid],
    queryFn: () => fetchData(uuid.toString()),
  });

  if (isError) {
    Alert.alert('Peringatan!', 'Kendaraan tidak aktif atau kendaraan tidak ada!', [
      { text: 'Kembali', onPress: () => router.back() },
    ]);
  }

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

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('latitude', coordinate.lat.toString());
      formData.append('longitude', coordinate.long.toString());
      formData.append('kegiatan', values.kegiatan);
      formData.append('spidometer', values.spidometer);
      formData.append('kendaraan_id', data?.id || '');
      formData.append('fileImage', {
        uri: values.fileImage,
        name: 'spidometer-capture.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await secureApi.postForm('/reservasi/save_detail', formData);
      await startTracking();
      await SecureStore.setItemAsync('DataAktif', JSON.stringify(response.data));
      router.dismissTo('/(protected)/(tabs)');
    } catch (error: unknown) {
      HandleError(error);
    } finally {
      setLoading(false);
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
          initialValues={{ kegiatan: '', spidometer: '', fileImage: '' }}
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
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                <VehicleHeaderCard
                  variant="pemakaian"
                  label="Mulai Pemakaian Kendaraan"
                  name={data?.name}
                  noPolisi={data?.no_polisi}
                />

                {/* Tracking notice */}
                <View className="mx-4 mb-3 flex-row items-start gap-2 rounded-xl bg-emerald-50 p-3">
                  <View className="rounded-full bg-emerald-100 p-1.5">
                    <MaterialCommunityIcons name="map-marker-path" size={14} color="#10b981" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-emerald-700">
                      Tracking lokasi akan dimulai
                    </Text>
                    <Text className="mt-0.5 text-[11px] text-emerald-600/80">
                      Setelah simpan, aplikasi akan merekam rute perjalanan kendaraan secara
                      otomatis hingga proses pengembalian.
                    </Text>
                  </View>
                </View>

                <View className="mx-4 rounded-2xl bg-white p-5 shadow-sm">
                  <View className="mb-4 flex-row items-center gap-2 border-b border-slate-100 pb-3">
                    <Feather name="edit-3" size={16} color="#205781" />
                    <Text className="text-base font-bold text-gray-800">Detail Pemakaian</Text>
                  </View>

                  <InputArea
                    className="bg-gray-50"
                    label="Kegiatan / Tujuan"
                    placeholder="Contoh: Antar pasien ke rumah sakit B"
                    value={values.kegiatan}
                    error={touched.kegiatan ? errors.kegiatan : undefined}
                    onChangeText={handleChange('kegiatan')}
                  />

                  <PhotoCaptureField
                    label="Foto Spidometer Awal"
                    helper="Pastikan angka spidometer terlihat jelas"
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
                      isSubmitting ? 'bg-emerald-300' : 'bg-emerald-500'
                    }`}>
                    <MaterialCommunityIcons name="play-circle" size={18} color="white" />
                    <Text className="text-base font-bold text-white">
                      {isSubmitting ? 'Memproses...' : 'Mulai Pemakaian'}
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
          title="Foto Spidometer"
          visible={!!previewUri}
          imgUrl={previewUri}
          onPress={() => setPreviewUri(null)}
        />
      )}
    </KeyboardAvoidingView>
  );
}
