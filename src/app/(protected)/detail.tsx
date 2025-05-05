import { Alert, BackHandler, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import Input from "@/components/Input";
import InputArea from "@/components/InputArea";
import ButtonCostum from "@/components/ButtonCostum";
import { AntDesign } from '@expo/vector-icons';
import { Image } from "expo-image";
import ModalCamera from "@/components/ModalCamera";
import SafeAreaView from "@/components/SafeAreaView";
import secureApi from "@/services/service";
import { Formik } from "formik";
import * as yup from 'yup';
import { colors } from "@/constants/colors";
import * as SecureStore from 'expo-secure-store';
import { reLocation } from "@/hooks/locationRequired";

interface dataDetail {
  name: string;
  no_polisi: string;
}

interface Coords {
  lat: string;
  long: string;
}

const validationSchema = yup.object().shape({
  kegiatan: yup.string().required('Kegiatan harus diisi'),
  spidometer: yup.number().required('Spidometer harus diisi'),
});


export default function DetailScreen() {
  const { uuid } = useLocalSearchParams();


  const [reqLocation, setReqLocation] = useState<boolean>(false)
  const [loading, setLoading] = useState(false);

  const [kendaraanID, setKendaraanID] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [row, setRow] = useState<dataDetail>()


  const [uri, setUri] = useState<String | null>(null);
  const [blob, setBlob] = useState<String | null>(null);

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



  useEffect(() => {

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await secureApi.get(`/reservasi/detail?uniqued_id=${uuid}`);

        console.log(res.data);
        setRow(res.data)

        setKendaraanID(res.data.id)

      } catch (error: any) {
        console.log("Error fetching data:", JSON.stringify(error.response?.data?.message));
        // console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, [uuid]);

  const handleSubmitKegiatan = async (values: any) => {
    setLoading(true)
    if (!uri && values.spidometer == '') {
      Alert.alert('Peringatan!', 'Foto spidometer belum di ambil', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        { text: 'YES', onPress: () => null },
      ]);
      return
    }
    const coordinate = await reLocation.getCoordinate()

    if (!coordinate?.lat && coordinate?.long) {
      Alert.alert('Peringatan!', 'Error device location', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        { text: 'YES', onPress: () => null },
      ]);
      return
    }

    try {

      const formData = new FormData();
      formData.append('latitude', coordinate?.lat?.toString() || '');
      formData.append('longitude', coordinate?.long.toString() || '');
      formData.append('kegiatan', values.kegiatan);
      formData.append('spidometer', values.spidometer);
      formData.append('kendaraan_id', kendaraanID ? kendaraanID : '');
      formData.append('fileImage', {
        uri: uri,
        name: 'spidometer-capture.jpg',
        type: 'image/jpeg',
      } as any);

      console.log('formData', formData);

      const response = await secureApi.postForm('/reservasi/save_detail', formData)
      console.log('response ', JSON.stringify(response));

      if (response.status === true) {
         await SecureStore.setItemAsync('reservasi_id', response.data.reservasi_id);
        // toast.success(response.message)
        // localStorage.setItem('reservasi_id', response.data.reservasi_id);
        // navigate('/reservasi');
        router.replace('(protected)/perjalanan')
      } else {
        Alert.alert('Peringatan!', response.message, [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          { text: 'YES', onPress: () => null },
        ]);
        // toast.error(response.message)
      }
    } catch (error :any) {
      // alert(error.response.data.message)
      console.log('response error', JSON.stringify(error.response.data));
    } finally{
      setLoading(false);
    }


  }


  return (

    <SafeAreaView className="flex-1 bg-slate-300">
      <View className='absolute w-full bg-[#205781] h-80 rounded-br-[50]  rounded-bl-[50]' />
      <KeyboardAvoidingView className="flex-1 mt-10" behavior={keyboardBehavior} keyboardVerticalOffset={keyboardVerticalOffset}>
        <ScrollView>
          <View className="m-4 p-4 bg-white rounded-lg">
            <View className="items-center mb-3 py-2">
              <Text className="text-5xl text-center font-bold">{row?.name}</Text>
              <Text className="font-medium text-center mt-3">{row?.no_polisi}</Text>
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
                      <Text className="font-bold text-white ms-2">Open Camera</Text>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <View className="w-full rounded-lg bg-black my-4">
                        <Image
                          source={{ uri }}
                          contentFit="contain"
                          style={{ aspectRatio: 1, resizeMode: 'contain' }}
                        />
                        <TouchableOpacity className="absolute right-2 top-2" onPress={() => {
                          setUri(null)
                          setBlob(null)
                          values.spidometer = '';
                        }}>
                          <AntDesign name="closecircleo" size={32} color="red" />
                        </TouchableOpacity>
                      </View>
                      <Input className="bg-gray-200" label="Spidometer" placeholder="Angka spidometer" inputMode={'numeric'} value={values.spidometer} error={errors.spidometer} onChangeText={handleChange('spidometer')} />
                    </>
                  )}
                  <ButtonCostum classname={colors.primary} title="Submit" loading={loading} onPress={handleSubmit} />
                </>
              )}
            </Formik>

            <ButtonCostum classname={colors.warning} title="Kembali" loading={loading} onPress={backAction} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <ModalCamera visible={modalVisible} onClose={() => setModalVisible(false)} setUriImage={(e) => setUri(e)} />
    </SafeAreaView>

  );
}
