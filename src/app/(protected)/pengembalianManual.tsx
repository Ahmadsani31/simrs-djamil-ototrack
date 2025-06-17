import { Alert, BackHandler, Image, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import Input from "@/components/Input";
import ModalCamera from "@/components/ModalCamera";
import SafeAreaView from "@/components/SafeAreaView";
import secureApi from "@/services/service";
import { Formik, FormikValues } from "formik";
import * as yup from 'yup';
import { colors } from "@/constants/colors";
import { useLoadingStore } from "@/stores/loadingStore";

import { useQuery } from "@tanstack/react-query";
import SkeletonList from "@/components/SkeletonList";
import { dataDetail } from "@/types/types";

import { Entypo, Fontisto, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';

import InputArea from "@/components/InputArea";
import InputDate from "@/components/InputDate";
import InputFile from "@/components/InputFile";
import dayjs from "dayjs";

const validationSchema = yup.object().shape({
  spidometer: yup.number().required('Spidometer harus diisi (required)'),
  keterangan: yup.string().required('Keterangan harus diisi (required)'),
});

const fetchData = async (reservasi_id: string, user_id: string) => {
  const response = await secureApi.get(`/reservasi/cek_data_aktif_admin`, {
    params: {
      reservasi_id: reservasi_id,
      user_id: user_id,
    }
  });
  return response.data;
};

export default function PengembalianManualScreen() {

  const { reservasi_id, user_id } = useLocalSearchParams();

  const [dateInput, setDateInput] = useState('');

  const [errorInput, setErrorInput] = useState({ 'tanggal': '', 'fileUpload': '' });

  const { data, isLoading, error, isError } = useQuery<dataDetail>({
    queryKey: ['dataPengembalian', reservasi_id, user_id],
    queryFn: () => fetchData(reservasi_id.toString(), user_id.toString()),
  })

  if (isError) {
    Alert.alert('Peringatan!', 'Data tidak valid atau kendaraan tidak aktif!', [
      { text: 'Kembali', onPress: () => router.back() },
    ]);
  }

  const setLoading = useLoadingStore((state) => state.setLoading);


  const [uri, setUri] = useState<string | null>(null);

  const validateForm = () => {
    const errors: { tanggal: string; fileUpload: string } = { tanggal: '', fileUpload: '' };
    if (!dateInput) {
      errors.tanggal = 'Tanggal harus diisi (required)';
    } else {
      errors.tanggal = '';
    }

    if (!uri) {
      errors.fileUpload = 'Imgae harus diisi (required)';
    } else {
      errors.fileUpload = '';
    }

    setErrorInput(errors);

    // Mengembalikan true jika tidak ada error
    return errors.tanggal === '' && errors.fileUpload === '';
  };

  const handlePengembalian = async (values: FormikValues) => {
    setLoading(true)

    console.log('error');

    console.log(validateForm());


    if (!validateForm()) {
      // Submit form

      setLoading(false);
      return false;
    }


    try {

      const formData = new FormData();

      formData.append('id', reservasi_id.toString());
      formData.append('spidometer_out', values.spidometer);
      formData.append('reservasi_out', dayjs(dateInput).format('YYYY-MM-DD HH:mm:ss'));
      formData.append('keterangan_pengembalian', values.keterangan);
      formData.append('check_pegembalian_manual', '1');
      formData.append('spidometer_file_out', {
        uri: uri,
        name: 'spidometer-capture.jpg',
        type: 'image/jpeg',
      } as any);

      console.log('formData', formData);

      await secureApi.postForm('/reservasi/pengembalian_manual', formData)
      // console.log('response ', JSON.stringify(response.data));

      // await SecureStore.deleteItemAsync('pemakaianAktif');
      // console.log(response.message);
      router.replace('(tabs)')
    } catch (error: any) {
      // console.log(JSON.stringify(error));
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



  const handleResetTanggal = () => {
    setDateInput('');
  }


  return (

    <SafeAreaView className="flex-1 bg-slate-300" noTop>
      <View className='absolute w-full bg-[#205781] h-80 rounded-br-[50]  rounded-bl-[50]' />
      <ScrollView className="flex-1">
        <View className="m-4 p-4 bg-white rounded-lg">
          {isLoading || isError ? <SkeletonList loop={5} /> : (
            <>
              <View className="items-center mb-3 py-2">
                <Text className="text-5xl text-center font-bold">{data?.name}</Text>
                <Text className="font-medium text-center mt-3">{data?.no_polisi}</Text>
              </View>
              <View className="border border-b-2 w-full mb-4" />
              <Formik
                initialValues={{ spidometer: '', keterangan: '', }}
                validationSchema={validationSchema}
                onSubmit={async (values) => await handlePengembalian(values)}
              >
                {({ handleChange, handleSubmit, values, errors, touched }) => (
                  <>
                    <Input className="bg-gray-200" label="Spidometer" placeholder="Angka spidometer" inputMode={'numeric'} value={values.spidometer} error={errors.spidometer} onChangeText={handleChange('spidometer')} />
                    <InputDate label="Waktu Pengembalian" onChangeDate={(e) => setDateInput(e)} onResetDate={handleResetTanggal} value={dateInput} error={errorInput.tanggal} />

                    {!uri ? (
                      <InputFile label="Upload file" onChangeFile={(e) => setUri(e)} placeholder={'Chose file'} error={errorInput.fileUpload} />
                    ) : (
                      <>
                        <View className="w-full rounded-lg bg-black my-4">
                          <Image
                            source={{ uri: uri || undefined }}
                            className='w-full aspect-[3/4] rounded-lg'
                          />
                          <TouchableOpacity className="absolute right-1 bg-white rounded-full p-1 top-1" onPress={() => {
                            setUri(null)
                          }}>
                            <AntDesign name="closecircleo" size={32} color="red" />
                          </TouchableOpacity>
                        </View>
                      </>
                    )}

                    <InputArea className="bg-gray-200" label="Keterangan" placeholder="Keterangan pengembalian manual" value={values.keterangan} error={touched.keterangan ? errors.keterangan : undefined} onChangeText={handleChange('keterangan')} />
                    <TouchableOpacity className={`flex-row gap-2 p-3 my-2 rounded-lg justify-center items-center ${colors.secondary}`} onPress={() => handleSubmit()} >
                      <Text className='text-white font-bold'>Pengembalian Kendaraan Manual</Text>
                      <MaterialCommunityIcons name='car' size={22} color='white' />
                    </TouchableOpacity>

                  </>
                )}
              </Formik>
            </>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>

  );
}
