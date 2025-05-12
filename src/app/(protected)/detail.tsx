import { Alert, BackHandler, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import Input from "@/components/Input";
import InputArea from "@/components/InputArea";
import ButtonCostum from "@/components/ButtonCostum";
import { AntDesign } from '@expo/vector-icons';
import ModalCamera from "@/components/ModalCamera";
import SafeAreaView from "@/components/SafeAreaView";
import secureApi from "@/services/service";
import { Formik, FormikValues } from "formik";
import * as yup from 'yup';
import { colors } from "@/constants/colors";
import * as SecureStore from 'expo-secure-store';
import { reLocation } from "@/hooks/locationRequired";
import { useLoadingStore } from "@/stores/loadingStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SkeletonList from "@/components/SkeletonList";
import { Entypo } from '@expo/vector-icons';

interface dataDetail {
  id: string;
  name: string;
  no_polisi: string;
}

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

  const { data: dataDetail, isLoading: loadingKendaraan, error } = useQuery<dataDetail>({
    queryKey: ['dataDetail', uuid],
    queryFn: () => fetchData(uuid.toString()),
    enabled: !!uuid

  })

  const [reqLocation, setReqLocation] = useState<boolean>(false)

  const setLoading = useLoadingStore((state) => state.setLoading);

  const [modalVisible, setModalVisible] = useState(false);


  const [uri, setUri] = useState<string | null>(null);

  const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;
  const keyboardBehavior = Platform.OS === 'ios' ? 'padding' : 'height';

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
    loadLocation();

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const loadLocation = async () => {
    const reLoc = await reLocation.enable()
    setReqLocation(reLoc);
  }

  const handleSubmitKegiatan = async (values: FormikValues) => {
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
    formData.append('kendaraan_id', dataDetail?.id || '');
    formData.append('fileImage', {
      uri: uri,
      name: 'spidometer-capture.jpg',
      type: 'image/jpeg',
    } as any);

    try {

      // console.log('formData', formData);

      const response = await secureApi.postForm('/reservasi/save_detail', formData)

      console.log('response ', JSON.stringify(response));

      await SecureStore.setItemAsync('pemakaianAktif', JSON.stringify(response.data));
      // console.log(response.message);
      router.replace('(protected)/pemakaian')
    } catch (error: any) {
      // alert(error.response.data.message)
      console.log('response error', JSON.stringify(error.response.data.message));
      Alert.alert('Warning!', error.response.data.message, [
        {
          text: 'Tutup',
          onPress: () => null,
          style: 'cancel',
        }
      ]);
    } finally {
      setLoading(false);
    }

  }

  return (

    <SafeAreaView className="flex-1 bg-slate-300">
      <View className='absolute w-full bg-[#205781] h-80 rounded-br-[50]  rounded-bl-[50]' />
      <KeyboardAvoidingView className="flex-1" behavior={keyboardBehavior} keyboardVerticalOffset={keyboardVerticalOffset}>
        <View className="flex-row items-center justify-around px-4 mt-4">
          <Image style={{ width: 40, height: 40 }} source={require('@asset/images/logo/logo-M-Djamil.png')} />
          <View className="w-64">
            <Text className="text-2xl font-bold text-white text-center">Detail Pemakaian Kendaraan</Text>
          </View>
          <TouchableHighlight onPress={backAction} className={`bg-red-500 p-1 rounded-full`}>
            <Entypo name="circle-with-cross" size={24} color={'white'} />
          </TouchableHighlight>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
          {loadingKendaraan ? <SkeletonList loop={5} /> : (
            <View className="m-4 p-4 bg-white rounded-lg">
              <View className="items-center mb-3 py-2">
                <Text className="text-3xl text-center font-bold">{dataDetail?.name}</Text>
                <Text className="font-medium text-center mt-3">{dataDetail?.no_polisi}</Text>
              </View>
              <View className="border border-b-2 w-full mb-4" />
              <Formik
                initialValues={{ kegiatan: '', spidometer: '' }}
                validationSchema={validationSchema}
                onSubmit={async (values) => await handleSubmitKegiatan(values)}
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
                        <Input className="bg-gray-200" label="Spidometer" placeholder="Angka spidometer" inputMode={'numeric'} value={values.spidometer} error={errors.spidometer} onChangeText={handleChange('spidometer')} />
                      </>
                    )}
                    {uri && 
                    <ButtonCostum classname={colors.primary} title="Simpan" onPress={handleSubmit} />
                    }
                  </>
                )}
              </Formik>

              {/* <ButtonCostum classname={colors.warning} title="Batal" onPress={backAction} /> */}
            </View>
          )

          }
        </ScrollView>
      </KeyboardAvoidingView>
      <ModalCamera visible={modalVisible} onClose={() => setModalVisible(false)} setUriImage={(e) => setUri(e)} />
    </SafeAreaView>

  );
}
