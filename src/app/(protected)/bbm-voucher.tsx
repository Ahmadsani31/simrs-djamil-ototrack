import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Image as ImageExpo } from 'expo-image';
import { Formik } from 'formik';
import { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Toast } from 'toastify-react-native';
import * as yup from 'yup';

import SkeletonList from '@/components/feedback/SkeletonList';
import CustomNumberInput from '@/components/forms/CustomNumberInput';
import PhotoCaptureField from '@/components/forms/PhotoCaptureField';
import ModalCamera from '@/components/modals/ModalCamera';
import ModalPreviewImage from '@/components/modals/ModalPreviewImage';
import VehicleHeaderCard from '@/components/sections/VehicleHeaderCard';
import KeyboardAwareScreen from '@/components/layout/KeyboardAwareScreen';
import { reLocation } from '@/hooks/locationRequired';
import secureApi from '@/services/service';
import HandleError from '@/utils/handleError';

type propsBBMVoucher = {
  bbm_id: string;
  liter: string;
  type_bbm: string;
};

type FormValues = {
  spidometer: string;
  uriLokasi: string;
  uriStruck: string;
};

const validationSchema = yup.object().shape({
  spidometer: yup.number().typeError('Harus angka').required('Nilai spidometer harus diisi'),
  uriLokasi: yup.string().required('Foto nilai spidometer harus diambil'),
  uriStruck: yup.string().required('Foto struk pembelian harus diambil'),
});

const fetchData = async (kendaraan_id: string) => {
  const response = await secureApi.get(`/bbm`, {
    params: {
      kendaraan_id,
    },
  });
  return response.data;
};

export default function BbmVoucherScreen() {
  const { kendaraan_id, reservasi_id } = useLocalSearchParams();

  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'spidometer' | 'struk'>('spidometer');
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery<propsBBMVoucher>({
    queryKey: ['bbm-voucher', kendaraan_id],
    queryFn: () => fetchData(kendaraan_id.toString()),
  });

  if (isError) {
    return (
      <View className="flex-1 items-center justify-start bg-white p-4">
        <ImageExpo
          source={require('assets/images/gif/forbidden.gif')}
          style={{ width: 280, height: 280 }}
          transition={1000}
        />
        <View className="m-5 flex-row items-center gap-3 rounded-xl bg-red-500 p-4">
          <Feather name="alert-circle" size={20} color="white" />
          <Text className="flex-1 font-medium text-white">
            Pengisian BBM dengan VOUCHER dibatasi. Silahkan hubungi admin atau yang terkait untuk
            pengajuan.
          </Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center gap-2 rounded-xl bg-slate-700 px-5 py-3"
          activeOpacity={0.85}
          onPress={() => router.back()}>
          <Feather name="arrow-left" size={16} color="white" />
          <Text className="font-bold text-white">Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSubmitProsesBBM = async (values: FormValues) => {
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
      formData.append('id', data?.bbm_id || '');
      formData.append('latitude', coordinate.lat.toString());
      formData.append('longitude', coordinate.long.toString());
      formData.append('reservasi_id', reservasi_id ? reservasi_id.toString() : '');
      formData.append('spidometer', values.spidometer);
      formData.append('imgSpidometer', {
        uri: values.uriLokasi,
        name: 'lokasi-capture.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('imgStruk', {
        uri: values.uriStruck,
        name: 'struck-capture.jpg',
        type: 'image/jpeg',
      } as any);

      await secureApi.postForm('/bbm/store_voucher', formData);
      router.dismissTo('/(protected)/(tabs)');
    } catch (error: unknown) {
      HandleError(error);
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
          initialValues={{ spidometer: '', uriLokasi: '', uriStruck: '' }}
          validationSchema={validationSchema}
          onSubmit={async (values) => await handleSubmitProsesBBM(values)}>
          {({ handleSubmit, values, errors, touched, setFieldValue, isSubmitting }) => (
            <>
              <ScrollView
                contentContainerStyle={{ paddingBottom: 24 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                <VehicleHeaderCard variant="bbm" label="Pengisian BBM (Voucher)" />

                {/* Voucher card */}
                <View className="mx-4 mb-3 overflow-hidden rounded-2xl bg-white shadow-sm">
                  <View className="bg-orange-500 px-4 py-3">
                    <View className="flex-row items-center gap-2">
                      <MaterialCommunityIcons name="ticket-confirmation" size={16} color="white" />
                      <Text className="text-xs font-medium text-white/90">Voucher BBM</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-4 px-4 py-4">
                    <View className="flex-1">
                      <Text className="text-xs text-gray-400">Volume</Text>
                      <Text className="text-3xl font-bold text-gray-800">
                        {data?.liter || '-'}{' '}
                        <Text className="text-base font-medium text-gray-500">Liter</Text>
                      </Text>
                    </View>
                    <View className="h-12 w-px bg-slate-200" />
                    <View className="flex-1">
                      <Text className="text-xs text-gray-400">Jenis BBM</Text>
                      <Text className="text-base font-bold text-gray-800">
                        {data?.type_bbm || '-'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Spidometer block */}
                <View className="mx-4 mb-3 rounded-2xl bg-white p-5 shadow-sm">
                  <View className="mb-4 flex-row items-center gap-2 border-b border-slate-100 pb-3">
                    <MaterialCommunityIcons name="speedometer" size={16} color="#205781" />
                    <Text className="text-base font-bold text-gray-800">Spidometer Saat Ini</Text>
                  </View>

                  <PhotoCaptureField
                    label="Foto Spidometer"
                    helper="Foto angka spidometer terkini"
                    value={values.uriLokasi}
                    onCapture={() => {
                      setCameraTarget('spidometer');
                      setCameraVisible(true);
                    }}
                    onClear={() => {
                      setFieldValue('uriLokasi', '');
                      setFieldValue('spidometer', '');
                    }}
                    onPreview={() => setPreviewUri(values.uriLokasi)}
                    error={touched.uriLokasi ? errors.uriLokasi : undefined}
                    disabled={isSubmitting}
                  />

                  {values.uriLokasi ? (
                    <CustomNumberInput
                      className="bg-gray-50"
                      placeholder="Masukan nilai spidometer"
                      label="Nilai Spidometer"
                      value={values.spidometer}
                      error={touched.spidometer ? errors.spidometer : undefined}
                      onFormattedValue={(raw) => setFieldValue('spidometer', raw)}
                    />
                  ) : null}
                </View>

                {/* Struk block */}
                <View className="mx-4 mb-3 rounded-2xl bg-white p-5 shadow-sm">
                  <View className="mb-4 flex-row items-center gap-2 border-b border-slate-100 pb-3">
                    <MaterialCommunityIcons name="receipt" size={16} color="#205781" />
                    <Text className="text-base font-bold text-gray-800">Bukti Pengisian</Text>
                  </View>

                  <PhotoCaptureField
                    label="Foto Struk Pembelian"
                    helper="Bukti pengisian dari SPBU"
                    value={values.uriStruck}
                    onCapture={() => {
                      setCameraTarget('struk');
                      setCameraVisible(true);
                    }}
                    onClear={() => setFieldValue('uriStruck', '')}
                    onPreview={() => setPreviewUri(values.uriStruck)}
                    error={touched.uriStruck ? errors.uriStruck : undefined}
                    disabled={isSubmitting}
                  />
                </View>

                <View className="mx-4">
                  <TouchableOpacity
                    activeOpacity={0.85}
                    disabled={isSubmitting}
                    onPress={() => handleSubmit()}
                    className={`flex-row items-center justify-center gap-2 rounded-xl py-3.5 ${
                      isSubmitting ? 'bg-orange-300' : 'bg-orange-500'
                    }`}>
                    <MaterialCommunityIcons name="check-circle" size={18} color="white" />
                    <Text className="text-base font-bold text-white">
                      {isSubmitting ? 'Memproses...' : 'Simpan Pengisian BBM'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              {cameraVisible && (
                <ModalCamera
                  visible={cameraVisible}
                  onClose={() => setCameraVisible(false)}
                  setUriImage={(uri) => {
                    if (uri) {
                      setFieldValue(cameraTarget === 'spidometer' ? 'uriLokasi' : 'uriStruck', uri);
                    }
                  }}
                />
              )}
            </>
          )}
        </Formik>
      )}

      {previewUri && (
        <ModalPreviewImage
          title="Pratinjau Foto"
          visible={!!previewUri}
          imgUrl={previewUri}
          onPress={() => setPreviewUri(null)}
        />
      )}
    </KeyboardAwareScreen>
  );
}
