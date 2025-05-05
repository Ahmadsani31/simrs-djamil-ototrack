import { ActivityIndicator, Alert, Button, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useContext, useEffect, useRef, useState } from "react";
import ButtonCostum from "@/components/ButtonCostum";
import * as Location from 'expo-location'
import { useLocationStore } from "@/stores/locationStore";

import * as SecureStore from 'expo-secure-store';
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { colors } from "@/constants/colors";
import { ModalRN } from "@/components/ModalRN";
import { Formik, useFormik } from "formik";
import { Image } from "expo-image";
import Input from "@/components/Input";
import * as yup from 'yup';
import { AntDesign } from '@expo/vector-icons';
import ModalCamera from "@/components/ModalCamera";
import { reLocation } from "@/hooks/locationRequired";
import secureApi from "@/services/service";
import SafeAreaView from "@/components/SafeAreaView";
import { router } from "expo-router";

const BACKGROUND_TASK = 'background-location-task';

const validationSchema = yup.object().shape({
  spidometer: yup.number().required('Spidometer harus diisi'),
});

export default function PerjalananScreen() {

  const [displayCurrentAddress, setDisplayCurrentAddress] = useState('Location Loading.....');

  const [dialogCamera, setDialogCamera] = useState(false);
  const [dialogExit, setDialogExit] = useState(false);

  const [uri, setUri] = useState<String | null>(null);
  const [loading, setLoading] = useState(false);
  const [reqLocation, setReqLocation] = useState<boolean>(false)

  useEffect(() => {
    loadLocation();
  }, [])

  const formik = useFormik({
    initialValues: { spidometer: '' },
    validationSchema,
    onSubmit: async (values) => handleSubmit(values)
  });


  const handleSubmit = async (values: any) => {
    setLoading(true)
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

    const reservasi_id = await SecureStore.getItemAsync('reservasi_id');

    const formData = new FormData();
    formData.append('latitude', coordinate?.lat?.toString() || '');
    formData.append('longitude', coordinate?.long.toString() || '');
    formData.append('spidometer', values.spidometer);
    formData.append('reservasi_id', reservasi_id ? reservasi_id : '7');
    formData.append('fileImage', {
      uri: uri,
      name: 'spidometer-capture.jpg',
      type: 'image/jpeg',
    } as any);

    console.log('formData', formData);
    try {
      const response = await secureApi.postForm('/reservasi/return_kendaraan', formData)
      console.log('response ', JSON.stringify(response));

      if (response.status == true) {
         await SecureStore.deleteItemAsync('token');
        router.replace('(protected)');
        
      }else{
        Alert.alert('Peringatan!', response.message, [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          { text: 'YES', onPress: () => null },
        ]);
      }

    } catch (error: any) {
      console.log('response ', JSON.stringify(error.response.data));

    } finally{
      setLoading(false)
    }

  }


  const loadLocation = async () => {
    const reLoc = await reLocation.enable()
    setReqLocation(reLoc);
  }


  const handleDialogExit = () => {
    setDialogExit(false);
    setUri(null)
    formik.resetForm()
  }




  const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0
  const keyboardBehavior = Platform.OS === 'ios' ? 'padding' : 'height'
  return (
    <SafeAreaView noTop>
      <View className="flex-1 bg-slate-300">
        <View className='absolute w-full bg-[#205781] h-44 rounded-br-[50]  rounded-bl-[50]' />
        <KeyboardAvoidingView className="flex-1" behavior={keyboardBehavior} keyboardVerticalOffset={keyboardVerticalOffset}>

          <View className='px-4'>
            <ScrollView style={{ marginBottom: 80 }}>
              <View className="p-4 bg-white rounded-lg">
                <View className="items-center text-center mb-3">
                  <Text className="text-3xl font-bold">Live Location Tracking</Text>
                </View>
                <View className="p-2 items-center">
                  <Text className="text-center">{displayCurrentAddress}</Text>
                </View>
                <ButtonCostum classname={colors.secondary} title="Pengembalian Kendaraan" onPress={() => setDialogExit(!dialogExit)} />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>

        <ModalRN
          visible={dialogExit}
          onClose={handleDialogExit}
        >
          <ModalRN.Header onClose={handleDialogExit}>
            <Text className='font-bold text-center'>Proses Kembalikan Kendaraan</Text>
            <Text className="text-center">Silahkan foto spidometer kendaraan yang terbaru</Text>
          </ModalRN.Header>
          <ModalRN.Content>

            {formik.touched.spidometer && formik.errors.spidometer && <View className="p-4 my-4 bg-red-400 rounded-lg"><Text className="text-white">Foto spidometer dan Spidometer wajib di ambil dan isi</Text></View>}

            {!uri ? (
              <TouchableOpacity className="py-1 px-3 my-3 rounded-lg items-center justify-center flex-row bg-indigo-500" onPress={() => setDialogCamera(true)}>
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
                    formik.values.spidometer = '';
                    setUri(null)
                  }}>
                    <AntDesign name="closecircleo" size={32} color="red" />
                  </TouchableOpacity>
                </View>
                <Input className="bg-gray-200" label="Spidometer" placeholder="Angka spidometer" inputMode={'numeric'} value={formik.values.spidometer} error={formik.errors.spidometer} onChangeText={formik.handleChange('spidometer')} />
              </>
            )}
          </ModalRN.Content>
          <ModalRN.Footer>
            <View className="gap-2 flex-row">
              <ButtonCostum classname={colors.warning} title="Exit" onPress={handleDialogExit} />
              <ButtonCostum classname={colors.primary} loading={loading} title="Submit" onPress={formik.handleSubmit} />
            </View>
          </ModalRN.Footer>
        </ModalRN>
        <ModalCamera visible={dialogCamera} onClose={() => setDialogCamera(false)} setUriImage={(e) => setUri(e)} />
      </View>
    </SafeAreaView>
  );
}
