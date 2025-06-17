import { Alert, BackHandler, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import Input from "@/components/Input";
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import ModalCamera from "@/components/ModalCamera";
import SafeAreaView from "@/components/SafeAreaView";
import secureApi from "@/services/service";
import { Formik, FormikValues } from "formik";
import * as yup from 'yup';
import { colors } from "@/constants/colors";
import { reLocation } from "@/hooks/locationRequired";
import { useLoadingStore } from "@/stores/loadingStore";
import CustomHeader from "@/components/CustomHeader";

import { stopTracking } from '@/utils/locationUtils'

import { useLocationStore } from "@/stores/locationStore";
import { useQuery } from "@tanstack/react-query";
import SkeletonList from "@/components/SkeletonList";
import { dataDetail } from "@/types/types";

import { getStoredCoords } from "@/lib/secureStorage";

const validationSchema = yup.object().shape({
  spidometer: yup.number().required('Spidometer harus diisi'),
});

const fetchData = async (reservasi_id: string) => {
  const response = await secureApi.get(`/reservasi/cek_data_aktif`, {
    params: {
      reservasi_id: reservasi_id,
    }
  });
  return response.data;
};

export default function PengembalianScreen() {

  const { clearCoordinates } = useLocationStore();


  const { reservasi_id } = useLocalSearchParams();

  const { data, isLoading, error, isError } = useQuery<dataDetail>({
    queryKey: ['dataPengembalian', reservasi_id],
    queryFn: () => fetchData(reservasi_id.toString()),
  })

  if (isError) {
    Alert.alert('Peringatan!', 'Data tidak valid atau kendaraan tidak aktif!', [
      { text: 'Kembali', onPress: () => router.back() },
    ]);
  }

  const setLoading = useLoadingStore((state) => state.setLoading);

  const [modalVisible, setModalVisible] = useState(false);

  const [uri, setUri] = useState<string | null>(null);

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
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [router]);

  const handleSubmitExit = async (values: FormikValues) => {
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
    const asyncCoords = await getStoredCoords();

    // console.log('====================================');
    // console.log('coordinate', JSON.stringify(coords));
    // console.log('====================================');

    // console.log('====================================');
    // console.log('trackingData', asyncCoords);
    // console.log('====================================');
    // return
    try {

      const formData = new FormData();
      formData.append('latitude', coordinate?.lat?.toString() || '');
      formData.append('longitude', coordinate?.long.toString() || '');
      formData.append('spidometer', values.spidometer);
      formData.append('reservasi_id', reservasi_id.toString());
      formData.append('coordinates', JSON.stringify(asyncCoords));
      formData.append('fileImage', {
        uri: uri,
        name: 'spidometer-capture.jpg',
        type: 'image/jpeg',
      } as any);

      // console.log('formData', formData);

      await secureApi.postForm('/reservasi/return_kendaraan', formData)
      clearCoordinates()
      await stopTracking();
      // console.log('response ', JSON.stringify(response.data));

      // await SecureStore.deleteItemAsync('pemakaianAktif');
      // console.log(response.message);
      router.replace('(tabs)')
    } catch (error: any) {
      // alert(error.response.data.message)
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

  return (

    <SafeAreaView className="flex-1 bg-slate-300">
      <View className='absolute w-full bg-[#205781] h-80 rounded-br-[50]  rounded-bl-[50]' />
      <CustomHeader title="Pengembalian Kendaraan" onPress={backAction} />
      <ScrollView className="flex-1">
        <View className="m-4 p-4 bg-white rounded-lg">
          {isLoading || isError ? <SkeletonList loop={5} /> : (
            <>
              <View className="items-center mb-3 py-2">
                <Text className="text-5xl text-center font-bold">{data?.name}</Text>
                <Text className="font-medium text-center mt-3">{data?.no_polisi}</Text>
              </View>
              <View className="border border-b-2 w-full mb-4" />
              <Text className="text-center"> Silahkan foto spidometer kendaraan yang terbaru</Text>
              <Formik
                initialValues={{ spidometer: '' }}
                validationSchema={validationSchema}
                onSubmit={async (values) => await handleSubmitExit(values)}
              >
                {({ handleChange, handleSubmit, values, errors, touched }) => (
                  <>
                    {touched.spidometer && errors.spidometer && <View className="p-4 my-4 bg-red-400 rounded-lg"><Text className="text-white">Foto spidometer dan Spidometer wajib di ambil dan isi</Text></View>}
                    {!uri ? (
                      <TouchableOpacity className="py-1 px-3 my-3 rounded-lg items-center justify-center flex-row bg-indigo-500" onPress={() => setModalVisible(true)}>
                        <AntDesign name="camera" size={32} />
                        <Text className="font-bold text-white ms-2">Open Camera</Text>
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
                        <Input className="bg-gray-200" label="Spidometer" placeholder="Angka spidometer" inputMode={'numeric'} value={values.spidometer} error={ touched.spidometer ? errors.spidometer : undefined} onChangeText={handleChange('spidometer')} />
                      </>
                    )}
                    {uri && (
                      <TouchableOpacity className={`flex-row gap-2 p-3 my-2 rounded-lg justify-center items-center ${colors.secondary}`} onPress={() => handleSubmit()} >
                        <Text className='text-white font-bold'>Proses Pengembalian Kendaraan</Text>
                        <MaterialCommunityIcons name='car' size={22} color='white' />
                      </TouchableOpacity>
                    )}

                  </>
                )}
              </Formik>
            </>
          )}

        </View>
      </ScrollView>
      <ModalCamera visible={modalVisible} onClose={() => setModalVisible(false)} setUriImage={(e) => setUri(e)} />
    </SafeAreaView>

  );
}
