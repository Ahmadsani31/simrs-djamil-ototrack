import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import Input from '@/components/Input';
import InputArea from '@/components/InputArea';
import ButtonCostum from '@/components/ButtonCostum';
import secureApi from '@/services/service';
import { Formik, FormikValues } from 'formik';
import * as yup from 'yup';
import { colors } from '@/constants/colors';
import { reLocation } from '@/hooks/locationRequired';
import { useLoadingStore } from '@/stores/loadingStore';
import { useQuery } from '@tanstack/react-query';
import SkeletonList from '@/components/SkeletonList';
import { dataDetail } from '@/types/types';
import { Picker } from '@react-native-picker/picker';
import CustomNumberInput from '@/components/CustomNumberInput';
import HandleError from '@/utils/handleError';
import { Dropdown } from 'react-native-element-dropdown';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const validationSchema = yup.object().shape({
  keterangan: yup.string().required('Keterangan harus diisi'),
  lokasi: yup.string().required('lokasi / alamat pemiliharaan harus diisi'),
  jenis_kerusakan: yup.string().required('Jenis Kerusakan harus diisi'),
  spidometer: yup.number().required('Nilai spidometer harus diisi'),
});

const fetchData = async (uuid: string) => {
  const response = await secureApi.get(`/reservasi/detail?uniqued_id=${uuid}`);
  return response.data;
};

export default function ServiceScreen() {
  const insets = useSafeAreaInsets();

  const { uuid } = useLocalSearchParams();

  const setLoading = useLoadingStore((state) => state.setLoading);

  useEffect(() => {
    refetch();
  }, [uuid]);

  const { data, isLoading, error, isError, refetch } = useQuery<dataDetail>({
    queryKey: ['dataDetail', uuid],
    queryFn: () => fetchData(uuid.toString()),
  });

  if (isError) {
    Alert.alert('Peringatan!', 'Kendaraan tidak aktif atau kendaraan tidak ada!', [
      { text: 'Kembali', onPress: () => router.back() },
    ]);
  }

  const backAction = () => {
    Alert.alert('Peringatan!', 'Apakah Kamu yakin ingin membatalkan proses pemakaian kendaraan?', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel',
      },
      { text: 'YES', onPress: () => router.back() },
    ]);
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);

  const handleSubmitDetail = async (values: FormikValues) => {
    setLoading(true);

    const coordinate = await reLocation.getCoordinate();

    if (!coordinate?.lat && coordinate?.long) {
      Alert.alert('Peringatan!', 'Error device location', [{ text: 'Tutup', onPress: () => null }]);
      return;
    }

    const formData = new FormData();
    formData.append('latitude', coordinate?.lat?.toString() || '');
    formData.append('longitude', coordinate?.long.toString() || '');
    formData.append('keterangan', values.keterangan);
    formData.append('jenis_kerusakan', values.jenis_kerusakan);
    formData.append('lokasi', values.lokasi);
    formData.append('spidometer', values.spidometer);
    formData.append('kendaraan_id', data?.id || '');

    try {
      // console.log('formData', formData);
      const response = await secureApi.postForm('/service/store', formData);

      // console.log('response ', JSON.stringify(response));

      // await SecureStore.setItemAsync('pemakaianAktif', JSON.stringify(response.data));
      // console.log(response.message);
      router.dismissTo('/(protected)/(tabs)/(pemiliharaan)');
    } catch (error: any) {
      // console.log(error.response.data);
      HandleError(error);
    } finally {
      setLoading(false);
    }
  };

  const dataDrowdown = [
    { label: 'Service Rutin', value: 'Service Rutin' },
    { label: 'Service Radiator', value: 'Service Radiator' },
    { label: 'Ganti Sparepart', value: 'Ganti Sparepart' },
    { label: 'Ganti Oli', value: 'Ganti Oli' },
    { label: 'Ganti Aki', value: 'Ganti Aki' },
    { label: 'Ganti Ban', value: 'Ganti Ban' },
    { label: 'Tune Up Mesin', value: 'Tune Up Mesin' },
    { label: 'Ganti Kaca Film', value: 'Ganti Kaca Film' },
    { label: 'Dan Lain-lainnya...', value: 'Dan Lain-lainnya...' },
  ];
  const [isFocus, setIsFocus] = useState(false);

  return (
    <KeyboardAvoidingView
      className="bg-slate-300"
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
                <View className="flex-row items-center text-gray-500">
                  <View className="flex-grow border-t border-gray-300" />
                  <Text className="mx-2 text-lg text-[#205781]">Pemiliharaan Kendaaraan</Text>
                  <View className="flex-grow border-t border-gray-300" />
                </View>
                <View>
                  <Text className="text-center text-3xl font-bold">{data?.name}</Text>
                  <Text className="text-center font-medium">{data?.no_polisi}</Text>
                </View>
              </View>
              <View className="mb-4 w-full border border-b-2" />
              <Formik
                initialValues={{ jenis_kerusakan: '', keterangan: '', lokasi: '', spidometer: '' }}
                validationSchema={validationSchema}
                onSubmit={async (values) => await handleSubmitDetail(values)}>
                {({ handleChange, handleSubmit, values, errors, touched, setFieldValue }) => (
                  <>
                    <View className="mb-4">
                      <Text className="mb-1 font-bold text-gray-700">Jenis BBM</Text>
                      <Dropdown
                        style={[
                          styles.dropdown,
                          touched.jenis_kerusakan && errors.jenis_kerusakan
                            ? { borderColor: 'red' }
                            : { borderColor: 'gray' },
                        ]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={dataDrowdown}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={!isFocus ? 'Pilih jenis kerusakan' : '...'}
                        value={values.jenis_kerusakan}
                        onFocus={() => setIsFocus(true)}
                        onBlur={() => setIsFocus(false)}
                        onChange={(item) => {
                          setFieldValue('jenis_kerusakan', item.value);
                          setIsFocus(false);
                        }}
                      />
                      {touched.jenis_kerusakan && errors.jenis_kerusakan ? (
                        <Text className="mt-1 text-xs text-red-500">{errors.jenis_kerusakan}</Text>
                      ) : null}
                    </View>

                    <Input
                      label="Lokasi"
                      placeholder="lokasi / alamat pemiliharaan"
                      value={values.lokasi}
                      onChangeText={handleChange('lokasi')}
                      error={touched.lokasi ? errors.lokasi : undefined}
                      className="bg-gray-50"
                    />
                    <CustomNumberInput
                      className="bg-gray-100"
                      placeholder="Angka spidometer kendaraan"
                      value={values.spidometer}
                      label="Spidometer"
                      error={touched.spidometer ? errors.spidometer : undefined}
                      onFormattedValue={handleChange('spidometer')}
                    />
                    <InputArea
                      className="bg-gray-50"
                      label="Keterangan"
                      placeholder="keteragan..."
                      value={values.keterangan}
                      error={touched.keterangan ? errors.keterangan : undefined}
                      onChangeText={handleChange('keterangan')}
                    />

                    <ButtonCostum
                      classname={colors.secondary}
                      title="Simpan"
                      onPress={handleSubmit}
                    />
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
  },
  dropdown: {
    height: 42,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
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
