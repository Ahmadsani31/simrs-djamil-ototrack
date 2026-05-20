import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Formik } from 'formik';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Toast } from 'toastify-react-native';
import * as yup from 'yup';

import CustomNumberInput from '@/components/forms/CustomNumberInput';
import PhotoCaptureField from '@/components/forms/PhotoCaptureField';
import ModalCamera from '@/components/modals/ModalCamera';
import ModalPreviewImage from '@/components/modals/ModalPreviewImage';
import VehicleHeaderCard from '@/components/sections/VehicleHeaderCard';
import { reLocation } from '@/hooks/locationRequired';
import secureApi from '@/services/service';
import { dataDetail } from '@/types/types';
import HandleError from '@/utils/handleError';

type FormValues = {
  uriSpidometer: string;
  spidometer: string;
  typeBbm: string;
  uang: string;
  uriStruck: string;
};

const validationSchema = yup.object().shape({
  uriSpidometer: yup.string().required('Foto spidometer harus diambil'),
  spidometer: yup.number().typeError('Harus angka').required('Nilai spidometer harus diisi'),
  typeBbm: yup.string().required('Jenis BBM harus dipilih'),
  uang: yup.number().typeError('Harus angka').required('Nominal uang harus diisi'),
  uriStruck: yup.string().required('Foto struk pembelian harus diambil'),
});

const fetchData = async (reservasi_id: string) => {
  const response = await secureApi.get(`/reservasi/cek_data_aktif`, {
    params: {
      reservasi_id,
    },
  });
  return response.data;
};

const JENIS_BBM = [
  { label: 'Pertalite', value: 'Pertalite', color: '#10b981' },
  { label: 'Pertamax', value: 'Pertamax', color: '#3b82f6' },
  { label: 'Pertamax Turbo', value: 'Pertamax Turbo', color: '#ef4444' },
  { label: 'Dexlite', value: 'Dexlite', color: '#f59e0b' },
  { label: 'Pertamina Dex', value: 'Pertamina Dex', color: '#8b5cf6' },
  { label: 'Bio Solar (Solar)', value: 'Bio Solar (Solar)', color: '#eab308' },
] as const;

export default function BbmUangScreen() {
  const { kendaraan_id, reservasi_id } = useLocalSearchParams();

  const [cameraVisible, setCameraVisible] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'spidometer' | 'struk'>('spidometer');
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const { data, isError } = useQuery<dataDetail>({
    queryKey: ['pengembalian', reservasi_id],
    queryFn: () => fetchData(reservasi_id.toString()),
  });

  if (isError) {
    Alert.alert('Peringatan!', 'Data tidak valid atau kendaraan tidak aktif!', [
      { text: 'Kembali', onPress: () => router.back() },
    ]);
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
      formData.append('latitude', coordinate.lat.toString());
      formData.append('longitude', coordinate.long.toString());
      formData.append('reservasi_id', reservasi_id ? reservasi_id.toString() : '');
      formData.append('kendaraan_id', kendaraan_id ? kendaraan_id.toString() : '');
      formData.append('jenis', 'Uang');
      formData.append('uang', values.uang);
      formData.append('type_bbm', values.typeBbm);
      formData.append('spidometer', values.spidometer);
      formData.append('imgSpidometer', {
        uri: values.uriSpidometer,
        name: 'spidometer-capture.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('imgStruk', {
        uri: values.uriStruck,
        name: 'struck-capture.jpg',
        type: 'image/jpeg',
      } as any);

      await secureApi.postForm('/bbm/store_uang', formData);
      router.dismissTo('/(protected)/(tabs)');
    } catch (error: unknown) {
      HandleError(error);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-100"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
      <Formik<FormValues>
        initialValues={{
          uriSpidometer: '',
          spidometer: '',
          typeBbm: '',
          uang: '',
          uriStruck: '',
        }}
        validationSchema={validationSchema}
        onSubmit={async (values) => await handleSubmitProsesBBM(values)}>
        {({ handleSubmit, values, errors, touched, setFieldValue, isSubmitting }) => (
          <>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <VehicleHeaderCard
                variant="bbm"
                label="Pengisian BBM (Uang)"
                name={data?.name}
                noPolisi={data?.no_polisi}
              />

              <View className="mx-4 mb-3 flex-row items-start gap-2 rounded-xl bg-orange-50 p-3">
                <View className="rounded-full bg-orange-100 p-1.5">
                  <MaterialCommunityIcons name="cash" size={14} color="#ea580c" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-orange-700">
                    Pembayaran dengan uang tunai
                  </Text>
                  <Text className="mt-0.5 text-[11px] text-orange-600/80">
                    Foto spidometer terkini dan struk pembelian wajib disertakan sebagai bukti.
                  </Text>
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
                  value={values.uriSpidometer}
                  onCapture={() => {
                    setCameraTarget('spidometer');
                    setCameraVisible(true);
                  }}
                  onClear={() => {
                    setFieldValue('uriSpidometer', '');
                    setFieldValue('spidometer', '');
                  }}
                  onPreview={() => setPreviewUri(values.uriSpidometer)}
                  error={touched.uriSpidometer ? errors.uriSpidometer : undefined}
                  disabled={isSubmitting}
                />

                {values.uriSpidometer ? (
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

              {/* BBM detail block */}
              <View className="mx-4 mb-3 rounded-2xl bg-white p-5 shadow-sm">
                <View className="mb-4 flex-row items-center gap-2 border-b border-slate-100 pb-3">
                  <MaterialCommunityIcons name="gas-station" size={16} color="#205781" />
                  <Text className="text-base font-bold text-gray-800">Detail Pengisian</Text>
                </View>

                {/* Jenis BBM picker */}
                <View className="mb-4">
                  <Text className="mb-1 text-sm font-semibold text-gray-700">Jenis BBM</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setPickerVisible(true)}
                    className={`flex-row items-center justify-between rounded-xl border bg-gray-50 px-4 py-3 ${
                      touched.typeBbm && errors.typeBbm ? 'border-red-400' : 'border-gray-300'
                    }`}>
                    <View className="flex-1 flex-row items-center gap-2">
                      {values.typeBbm ? (
                        <View
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor:
                              JENIS_BBM.find((j) => j.value === values.typeBbm)?.color ?? '#94a3b8',
                          }}
                        />
                      ) : null}
                      <Text
                        className={`text-base ${
                          values.typeBbm ? 'text-gray-800' : 'text-gray-400'
                        }`}>
                        {values.typeBbm || 'Pilih jenis BBM'}
                      </Text>
                    </View>
                    <Feather name="chevron-down" size={18} color="#94a3b8" />
                  </TouchableOpacity>
                  {touched.typeBbm && errors.typeBbm ? (
                    <Text className="mt-1 text-xs text-red-500">{errors.typeBbm}</Text>
                  ) : null}
                </View>

                <CustomNumberInput
                  className="bg-gray-50"
                  placeholder="Masukan nominal uang"
                  label="Nominal Uang (Rp)"
                  value={values.uang}
                  error={touched.uang ? errors.uang : undefined}
                  onFormattedValue={(raw) => setFieldValue('uang', raw)}
                />

                <PhotoCaptureField
                  label="Foto Struk Pembelian"
                  helper="Bukti pembelian dari SPBU"
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
                    setFieldValue(
                      cameraTarget === 'spidometer' ? 'uriSpidometer' : 'uriStruck',
                      uri
                    );
                  }
                }}
              />
            )}

            {/* BBM type picker modal */}
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
                    <Text className="text-base font-bold text-gray-800">Pilih Jenis BBM</Text>
                    <TouchableOpacity onPress={() => setPickerVisible(false)} hitSlop={10}>
                      <Feather name="x" size={20} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                  <View>
                    {JENIS_BBM.map((item) => {
                      const selected = values.typeBbm === item.value;
                      return (
                        <TouchableOpacity
                          key={item.value}
                          activeOpacity={0.7}
                          onPress={() => {
                            setFieldValue('typeBbm', item.value);
                            setPickerVisible(false);
                          }}
                          className={`flex-row items-center gap-3 px-5 py-3.5 ${
                            selected ? 'bg-orange-50' : ''
                          }`}>
                          <View
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <Text
                            className={`flex-1 text-sm ${
                              selected ? 'font-bold text-orange-700' : 'text-gray-700'
                            }`}>
                            {item.label}
                          </Text>
                          {selected ? <Feather name="check" size={18} color="#ea580c" /> : null}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </Pressable>
              </Pressable>
            </Modal>
          </>
        )}
      </Formik>

      {previewUri && (
        <ModalPreviewImage
          title="Pratinjau Foto"
          visible={!!previewUri}
          imgUrl={previewUri}
          onPress={() => setPreviewUri(null)}
        />
      )}
    </KeyboardAvoidingView>
  );
}
