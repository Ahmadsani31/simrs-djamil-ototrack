import { AntDesign, Entypo } from '@expo/vector-icons';
import { Image as ImageExpo } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
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
import * as yup from 'yup';

import SkeletonList from '@/components/feedback/SkeletonList';
import ButtonCostum from '@/components/forms/ButtonCostum';
import CustomNumberInput from '@/components/forms/CustomNumberInput';
import ModalCamera from '@/components/modals/ModalCamera';
import { reLocation } from '@/hooks/locationRequired';
import secureApi from '@/services/service';


import { colors } from '@/constants/colors';
import { cn } from '@/utils/constants';
import HandleError from '@/utils/handleError';
import ModalPreviewImage from '@/components/modals/ModalPreviewImage';

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

export default function BbmVoucherScreen() {
  const { kendaraan_id, reservasi_id } = useLocalSearchParams();

  const [dialogCamera, setDialogCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [typeImage, setTypeImage] = useState<'lokasi' | 'struck'>('lokasi');
  const [data, setData] = useState<propsBBMVoucher>();

  const [modalVisible, setModalVisible] = useState(false);
  const [imgPreviewUrl, setImgPreviewUrl] = useState<string>();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await secureApi.get(`/bbm`, {
          params: {
            kendaraan_id,
          },
        });
        setData(response.data);
      } catch {
        setIsError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [kendaraan_id]);

  if (isError) {
    return (
      <View className="flex-1 items-center justify-start bg-white p-4">
        <ImageExpo
          source={require('assets/images/gif/forbidden.gif')}
          style={{ width: 300, height: 300 }}
          transition={1000}
        />
        <View className="m-5 flex-row items-center gap-3 rounded-lg bg-red-500 p-5">
          <AntDesign name="exclamation-circle" size={24} color="white" />
          <Text className="font-bold text-white">
            Pengisian BBM dengan VOUCHER dibatasi, silahkan hubungi admin atau yang yang terkait
            untuk pengajuan pengisian BBM dengan voucher
          </Text>
        </View>
        <TouchableOpacity
          className={cn('mt-4 flex-row items-center gap-2 rounded-lg p-3', colors.primary)}
          onPress={() => router.back()}>
          <Entypo name="back" size={24} color="white" />
          <Text className="text-white">Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSubmitProsesBBM = async (values: FormValues) => {
    const coordinate = await reLocation.getCoordinate();

    if (!coordinate?.lat || !coordinate?.long) {
      Alert.alert('Peringatan!', 'Error device location', [{ text: 'Tutup', onPress: () => null }]);
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
    <KeyboardAvoidingView
      className=" bg-slate-300"
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="absolute h-80 w-full rounded-bl-[50] rounded-br-[50]  bg-brand" />
        <View className="m-4 rounded-lg bg-white p-4">
          {loading ? (
            <SkeletonList loop={5} />
          ) : (
            <Formik<FormValues>
              initialValues={{ spidometer: '', uriLokasi: '', uriStruck: '' }}
              validationSchema={validationSchema}
              onSubmit={async (values) => await handleSubmitProsesBBM(values)}>
              {({ handleSubmit, values, errors, touched, setFieldValue, isSubmitting }) => (
                <>
                  <View className="mb-3 items-center gap-4 py-2">
                    <View className="flex-row items-center text-sm text-gray-500">
                      <View className="flex-grow border-t border-gray-300" />
                      <Text className="mx-2 text-lg font-bold text-brand">Pengisian BBM</Text>
                      <View className="flex-grow border-t border-gray-300" />
                    </View>
                    <Text className="text-center text-5xl font-bold">
                      Voucher : {data?.liter} Liter, {data?.type_bbm}
                    </Text>
                    <Text className="text-center text-sm">
                      Silahkan foto nilai spidometer terkini saat melakukan proses pengisian BBM
                      Kendaraan
                    </Text>
                  </View>

                  {/* Foto Spidometer */}
                  <View className="mb-3">
                    <Text className="mb-1 font-bold text-gray-700">Foto nilai spidometer</Text>
                    {!values.uriLokasi ? (
                      <TouchableOpacity
                        className={`flex-row items-center gap-2 rounded-lg border ${
                          touched.uriLokasi && errors.uriLokasi
                            ? 'border-red-500'
                            : 'border-gray-500'
                        } bg-slate-100 px-3 py-2`}
                        onPress={() => {
                          setTypeImage('lokasi');
                          setDialogCamera(true);
                        }}>
                        <AntDesign name="camera" size={24} color="black" />
                        <Text className="font-bold">Klik untuk ambil gambar</Text>
                      </TouchableOpacity>
                    ) : (
                      <View className="h-16 flex-row items-center justify-between gap-2 rounded-lg border border-gray-500 bg-slate-100 px-3 py-1">
                        <TouchableOpacity
                          className="flex-row items-center gap-2"
                          onPress={() => {
                            setImgPreviewUrl(values.uriLokasi);
                            setModalVisible(true);
                          }}>
                          <Image
                            source={{ uri: values.uriLokasi }}
                            className="size-10 rounded-lg"
                          />
                          <View>
                            <Text className="font-bold">foto-spidometer.jpg</Text>
                            <Text className="text-start text-xs">klik disini untuk lihat.</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="rounded-full bg-white p-1"
                          disabled={isSubmitting}
                          onPress={() => setFieldValue('uriLokasi', '')}>
                          <AntDesign name="close-circle" size={24} color="red" />
                        </TouchableOpacity>
                      </View>
                    )}
                    {touched.uriLokasi && errors.uriLokasi && (
                      <Text className="mt-1 text-xs text-red-500">{errors.uriLokasi}</Text>
                    )}
                  </View>

                  <CustomNumberInput
                    className="bg-gray-50"
                    placeholder="Masukan nilai Spidometer"
                    label="Nilai Spidometer"
                    value={values.spidometer}
                    error={touched.spidometer ? errors.spidometer : undefined}
                    onFormattedValue={(raw) => setFieldValue('spidometer', raw)}
                  />

                  {/* Foto Struk */}
                  <View className="mb-4">
                    <Text className="mb-1 font-bold text-gray-700">Foto struk pembelian</Text>
                    {!values.uriStruck ? (
                      <TouchableOpacity
                        className={`flex-row items-center gap-2 rounded-lg border ${
                          touched.uriStruck && errors.uriStruck
                            ? 'border-red-500'
                            : 'border-gray-500'
                        } bg-slate-100 px-3 py-2`}
                        onPress={() => {
                          setTypeImage('struck');
                          setDialogCamera(true);
                        }}>
                        <AntDesign name="camera" size={24} color="black" />
                        <Text className="font-bold">Klik untuk ambil gambar</Text>
                      </TouchableOpacity>
                    ) : (
                      <View className="flex-row items-center justify-between gap-2 rounded-lg border border-gray-500 bg-slate-100 px-3 py-1">
                        <TouchableOpacity
                          className="flex-row items-center gap-2"
                          onPress={() => {
                            setImgPreviewUrl(values.uriStruck);
                            setModalVisible(true);
                          }}>
                          <Image
                            source={{ uri: values.uriStruck }}
                            className="size-10 rounded-lg"
                          />
                          <View>
                            <Text className="font-bold">foto-struk-pembelian.jpg</Text>
                            <Text className="text-start text-xs">klik disini untuk lihat.</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="rounded-full bg-white p-1"
                          disabled={isSubmitting}
                          onPress={() => setFieldValue('uriStruck', '')}>
                          <AntDesign name="close-circle" size={24} color="red" />
                        </TouchableOpacity>
                      </View>
                    )}
                    {touched.uriStruck && errors.uriStruck && (
                      <Text className="mt-1 text-xs text-red-500">{errors.uriStruck}</Text>
                    )}
                  </View>

                  <ButtonCostum
                    classname={colors.secondary}
                    title="Simpan Pengisian BBM"
                    loading={isSubmitting}
                    onPress={handleSubmit}
                  />

                  {/* Camera modal — set field via Formik */}
                  {dialogCamera && (
                    <ModalCamera
                      visible={dialogCamera}
                      onClose={() => setDialogCamera(false)}
                      setUriImage={(uri) => {
                        if (uri) {
                          setFieldValue(typeImage === 'lokasi' ? 'uriLokasi' : 'uriStruck', uri);
                        }
                      }}
                    />
                  )}
                </>
              )}
            </Formik>
          )}
        </View>
      </ScrollView>
      {modalVisible && (
        <ModalPreviewImage
          title="Gambar Spidometer"
          visible={modalVisible}
          imgUrl={imgPreviewUrl || ''}
          onPress={() => setModalVisible(false)}
        />
      )}
    </KeyboardAvoidingView>
  );
}
