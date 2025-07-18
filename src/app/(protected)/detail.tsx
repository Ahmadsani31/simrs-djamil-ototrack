import { Alert, BackHandler, Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import Input from "@/components/Input";
import InputArea from "@/components/InputArea";
import ButtonCostum from "@/components/ButtonCostum";
import { AntDesign } from '@expo/vector-icons';
import ModalCamera from "@/components/ModalCamera";
import secureApi from "@/services/service";
import { Formik, FormikValues } from "formik";
import * as yup from 'yup';
import { colors } from "@/constants/colors";
import { reLocation } from "@/hooks/locationRequired";
import { useLoadingStore } from "@/stores/loadingStore";
import { useQuery } from "@tanstack/react-query";
import SkeletonList from "@/components/SkeletonList";
import CustomHeader from "@/components/CustomHeader";

import { startTracking } from '@/utils/locationUtils'
import { dataDetail } from "@/types/types";

const validationSchema = yup.object().shape({
  kegiatan: yup.string().required('Kegiatan harus diisi'),
  spidometer: yup.number().required('Spidometer harus diisi'),
});

const fetchData = async (uuid: string) => {
  const response = await secureApi.get(`/reservasi/detail?uniqued_id=${uuid}`);
  return response.data;
};


export default function DetailScreen() {
  const { uuid } = useLocalSearchParams();

  const setLoading = useLoadingStore((state) => state.setLoading);

  useEffect(() => {
    refetch();
  }, [uuid]);

  const { data, isLoading, error, isError, refetch } = useQuery<dataDetail>({
    queryKey: ['dataDetail', uuid],
    queryFn: () => fetchData(uuid.toString()),
  })

  if (isError) {
    Alert.alert('Peringatan!', 'Kendaraan tidak aktif atau kendaraan tidak ada!', [
      { text: 'Kembali', onPress: () => router.back() },
    ]);
  }

  const [modalVisible, setModalVisible] = useState(false);

  const [uri, setUri] = useState<string | null>(null);

  const handleSubmitDetail = async (values: FormikValues) => {
    setLoading(true)
    if (!uri && values.spidometer == '') {
      Alert.alert('Peringatan!', 'Foto spidometer belum di ambil', [
        { text: 'Tutup', onPress: () => null },
      ]);
      return
    }
    const coordinate = await reLocation.getCoordinate()

    if (!coordinate?.lat && coordinate?.long) {
      Alert.alert('Peringatan!', 'Error device location', [
        { text: 'Tutup', onPress: () => null },
      ]);
      return
    }

    const formData = new FormData();
    formData.append('latitude', coordinate?.lat?.toString() || '');
    formData.append('longitude', coordinate?.long.toString() || '');
    formData.append('kegiatan', values.kegiatan);
    formData.append('spidometer', values.spidometer);
    formData.append('kendaraan_id', data?.id || '');
    formData.append('fileImage', {
      uri: uri,
      name: 'spidometer-capture.jpg',
      type: 'image/jpeg',
    } as any);

    try {

      // console.log('formData', formData);

      const response = await secureApi.postForm('/reservasi/save_detail', formData)
      await startTracking();

      console.log('response ', JSON.stringify(response));

      // await SecureStore.setItemAsync('pemakaianAktif', JSON.stringify(response.data));
      // console.log(response.message);
      router.replace('(tabs)/pemakaian')
    } catch (error: any) {
      console.log(error.response.data);

      if (error.response && error.response.data) {
        const msg = error.response.data.message || "Terjadi kesalahan.";
        Alert.alert("Warning!", msg, [{ text: "Tutup", style: "cancel" }]);
      } else if (error.request) {
        Alert.alert("Network Error", "Tidak bisa terhubung ke server. Cek koneksi kamu.");
      } else {
        Alert.alert("Error", error.message);
      }
    } finally {
      setLoading(false);
    }

  }

  // const textInputRef = useRef<TextInput>(null);

  const setUriImageModal = (e: any) => {
    setUri(e)
    // textInputRef.current?.focus();
  }

  return (

    <KeyboardAvoidingView className="bg-slate-300" style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 100}>
      <View className='absolute w-full bg-[#205781] h-80 rounded-br-[50]  rounded-bl-[50]' />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="m-4 p-4 bg-white rounded-lg">
          {isLoading || isError ? <SkeletonList loop={5} /> : (
            <>
              <View className="items-center mb-3 py-2 gap-4">
                <View className='flex-row items-center text-gray-500 text-sm'>
                  <View className='flex-grow border-t border-gray-300' />
                  <Text className='text-[#205781] text-lg mx-2'>Jenis Kegiatan</Text>
                  <View className='flex-grow border-t border-gray-300' />
                </View>
                <View>
                  <Text className="text-3xl text-center font-bold">{data?.name}</Text>
                  <Text className="font-medium text-center mt-3">{data?.no_polisi}</Text>
                </View>
              </View>
              <View className="border border-b-2 w-full mb-4" />
              <Formik
                initialValues={{ kegiatan: '', spidometer: '' }}
                validationSchema={validationSchema}
                onSubmit={async (values) => await handleSubmitDetail(values)}
              >
                {({ handleChange, handleSubmit, values, errors, touched }) => (
                  <>
                    {touched.spidometer && errors.spidometer && <View className="p-4 my-4 bg-red-400 rounded-lg"><Text className="text-white">Kegiatan, Foto spidometer dan Spidometer wajib di ambil dan isi</Text></View>}
                    <InputArea className="bg-gray-200" label="Kegiatan" placeholder="Jenis Kegiatan" value={values.kegiatan} error={errors.kegiatan} onChangeText={handleChange('kegiatan')} />
                    {!uri ? (
                      <TouchableOpacity className="py-1 px-3 my-3 rounded-lg items-center justify-center flex-row bg-indigo-500" onPress={() => setModalVisible(true)}>
                        <AntDesign name="camera" size={32} />
                        <Text className="font-bold text-white ms-2">Foto Spidometer Awal</Text>
                      </TouchableOpacity>
                    ) : (
                      <>
                        <View className="w-full rounded-lg bg-black my-4">
                          <Image
                            source={{ uri: uri || undefined }}
                            className='w-full aspect-[3/4] rounded-lg'
                          />
                          <TouchableOpacity className="absolute right-1 bg-white rounded-full p-1 top-1" onPress={() => {
                            setUri(null)
                            values.spidometer = '';
                          }}>
                            <AntDesign name="closecircleo" size={32} color="red" />
                          </TouchableOpacity>
                        </View>
                        <Input className="bg-gray-200" label="Spidometer" placeholder="Angka spidometer"
                          inputMode={'numeric'}
                          value={values.spidometer}
                          error={touched.spidometer ? errors.spidometer : undefined}
                          onChangeText={handleChange('spidometer')} />
                      </>
                    )}
                    {uri &&
                      <ButtonCostum classname={colors.primary} title="Simpan" onPress={handleSubmit} />
                    }
                  </>
                )}
              </Formik>
            </>
          )}

        </View>
      </ScrollView>
      <ModalCamera visible={modalVisible} onClose={() => setModalVisible(false)} setUriImage={(e) => setUriImageModal(e)} />
    </KeyboardAvoidingView>

  );
}
