import { AntDesign } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Formik } from 'formik';
import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import * as yup from 'yup';

import ButtonCostum from '@/components/forms/ButtonCostum';
import CustomNumberInput from '@/components/forms/CustomNumberInput';
import ModalCamera from '@/components/modals/ModalCamera';
import { reLocation } from '@/hooks/locationRequired';
import secureApi from '@/services/service';

import { colors } from '@/constants/colors';
import { dataDetail } from '@/types/types';
import HandleError from '@/utils/handleError';
import ModalPreviewImage from '@/components/modals/ModalPreviewImage';

const fetchData = async (reservasi_id: string) => {
  const response = await secureApi.get(`/reservasi/cek_data_aktif`, {
    params: {
      reservasi_id,
    },
  });
  return response.data;
};

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

const dataDrowdown = [
  { label: 'Pertalite', value: 'Pertalite' },
  { label: 'Pertamax', value: 'Pertamax' },
  { label: 'Pertamax Turbo', value: 'Pertamax Turbo' },
  { label: 'Dexlite', value: 'Dexlite' },
  { label: 'Pertamina Dex', value: 'Pertamina Dex' },
  { label: 'Bio Solar (Solar)', value: 'Bio Solar (Solar)' },
];

export default function BbmUangScreen() {
  const { kendaraan_id, reservasi_id } = useLocalSearchParams();

  const [dialogCamera, setDialogCamera] = useState(false);
  const [typeImage, setTypeImage] = useState<'spidometer' | 'struck'>('spidometer');
  const [isFocus, setIsFocus] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [imgPreviewUrl, setImgPreviewUrl] = useState<string>();

  const { isError } = useQuery<dataDetail>({
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
      Alert.alert('Peringatan!', 'Error device location', [{ text: 'Tutup', onPress: () => null }]);
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
      className="bg-slate-300"
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="absolute h-80 w-full rounded-bl-[50] rounded-br-[50]  bg-brand" />
        <View className="m-4 rounded-lg bg-white p-4">
          <View className="mb-3 items-center gap-4 py-2">
            <View className="flex-row items-center text-sm text-gray-500">
              <View className="flex-grow border-t border-gray-300" />
              <Text className="mx-2 text-lg font-bold text-brand">Pengisian BBM Dengan Uang</Text>
              <View className="flex-grow border-t border-gray-300" />
            </View>
            <Text className="text-center text-sm">
              Proses pengisian BBM dengan Uang, silahkan ambil foto nilai spidometer terkini dan
              struk pengisian BBM Kendaraan.
            </Text>
          </View>

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
                {/* Foto Spidometer */}
                <View className="mb-3">
                  <Text className="mb-1 font-bold text-gray-700">Foto nilai spidometer</Text>
                  {!values.uriSpidometer ? (
                    <TouchableOpacity
                      className={`flex-row items-center gap-2 rounded-lg border ${
                        touched.uriSpidometer && errors.uriSpidometer
                          ? 'border-red-500'
                          : 'border-gray-500'
                      } bg-slate-100 px-3 py-2`}
                      onPress={() => {
                        setTypeImage('spidometer');
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
                          setImgPreviewUrl(values.uriSpidometer);
                          setModalVisible(true);
                        }}>
                        <Image
                          source={{ uri: values.uriSpidometer }}
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
                        onPress={() => setFieldValue('uriSpidometer', '')}>
                        <AntDesign name="close-circle" size={24} color="red" />
                      </TouchableOpacity>
                    </View>
                  )}
                  {touched.uriSpidometer && errors.uriSpidometer && (
                    <Text className="mt-1 text-xs text-red-500">{errors.uriSpidometer}</Text>
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

                <View className="mb-4">
                  <Text className="mb-1 font-bold text-gray-700">Jenis BBM</Text>
                  <Dropdown
                    style={[
                      styles.dropdown,
                      isFocus && { borderColor: 'blue' },
                      touched.typeBbm && errors.typeBbm ? { borderColor: 'red' } : null,
                    ]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={dataDrowdown}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocus ? 'Pilih Jenis BBM' : '...'}
                    searchPlaceholder="Search..."
                    value={values.typeBbm}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={(item) => {
                      setFieldValue('typeBbm', item.value);
                      setIsFocus(false);
                    }}
                  />
                  {touched.typeBbm && errors.typeBbm && (
                    <Text className="mt-1 text-xs text-red-500">{errors.typeBbm}</Text>
                  )}
                </View>

                <CustomNumberInput
                  className="bg-gray-50"
                  placeholder="Masukan nominal uang"
                  label="Uang"
                  value={values.uang}
                  error={touched.uang ? errors.uang : undefined}
                  onFormattedValue={(raw) => setFieldValue('uang', raw)}
                />

                {/* Foto Struk */}
                <View className="mb-4">
                  <Text className="mb-1 font-bold text-gray-700">Foto struk pembelian</Text>
                  {!values.uriStruck ? (
                    <TouchableOpacity
                      className={`flex-row items-center gap-2 rounded-lg border ${
                        touched.uriStruck && errors.uriStruck ? 'border-red-500' : 'border-gray-500'
                      } bg-slate-100 px-3 py-2`}
                      onPress={() => {
                        setTypeImage('struck');
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
                          setImgPreviewUrl(values.uriStruck);
                          setModalVisible(true);
                        }}>
                        <Image source={{ uri: values.uriStruck }} className="size-10 rounded-lg" />
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
                        setFieldValue(
                          typeImage === 'spidometer' ? 'uriSpidometer' : 'uriStruck',
                          uri
                        );
                      }
                    }}
                  />
                )}
              </>
            )}
          </Formik>
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

const styles = StyleSheet.create({
  dropdown: {
    height: 42,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
