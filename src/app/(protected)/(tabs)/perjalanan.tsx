import { ActivityIndicator, Alert, Button, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import ButtonCostum from "@/components/ButtonCostum";

import * as SecureStore from 'expo-secure-store';
import { colors } from "@/constants/colors";
import { ModalRN } from "@/components/ModalRN";
import * as yup from 'yup';
import { AntDesign } from '@expo/vector-icons';
import ModalCamera from "@/components/ModalCamera";
import { reLocation } from "@/hooks/locationRequired";
import secureApi from "@/services/service";
import SafeAreaView from "@/components/SafeAreaView";
import { router, useFocusEffect } from "expo-router";
import { useLoadingStore } from "@/stores/loadingStore";
import CheckpointScreen from "@/components/CheckpointScreen";
import SkeletonItem from "@/components/SkeletonItem";
import SkeletonList from "@/components/SkeletonList";

const BACKGROUND_TASK = 'background-location-task';

const validationSchema = yup.object().shape({
  spidometer: yup.number().required('Spidometer harus diisi'),
});

interface dataDetail {
  id: number;
  name: string;
  no_polisi: string;
  kegiatan: string;
  created_at: string
}

export default function PerjalananScreen() {

  const [displayCurrentAddress, setDisplayCurrentAddress] = useState('Location Loading.....');

  const [dialogCamera, setDialogCamera] = useState(false);
  const [dialogExit, setDialogExit] = useState(false);

  const [uri, setUri] = useState<string | null>(null);
  const setLoading = useLoadingStore((state) => state.setLoading);
  const [reqLocation, setReqLocation] = useState<boolean>(false)
  const [row, setRow] = useState<dataDetail>()
  const [checkpointStatus, setCheckpointStatus] = useState(false);
  const [loadingCheckpoint, setLoadingCheckpoint] = useState(true);
  const [checkpointID, setCheckpointID] = useState("");

  useEffect(() => {
    loadLocation();
    fetchDataAktif();

  }, [])

  // useFocusEffect(
  //   useCallback(() => {
  //     // Refresh logic here

  //   }, [])
  // );

  const fetchDataAktif = async () => {
    setLoading(true);
    try {
      const res = await secureApi.get(`reservasi/aktif`);
      console.log('res data aktif ', res.data);

      if (res.status === true) {
        setRow(res.data)
        fetchDataCheckpointAktif(res.data.id);
      }
    } catch (error: any) {
      // console.error("Error fetching data:", error);
      console.log("Error /reservasi/aktif ", JSON.stringify(error.response?.data?.message));

    } finally {
      setLoading(false);
    }
  };

  const fetchDataCheckpointAktif = async (reservasi_id: any) => {
    console.log('id reservasi ', reservasi_id);

    try {
      const res = await secureApi.get(`checkpoint/aktif`, {
        params: {
          reservasi_id: reservasi_id,
        },
      });
      console.log('res data checkpoint aktif ', res.data);

      if (res.status === true) {
        setCheckpointStatus(true)
        setCheckpointID(res.data.checkpoint_id);
      }
    } catch (error: any) {
      // console.error("Error fetching data:", error);
      console.log("Error /checkpoint/aktif ", JSON.stringify(error.response?.data?.message));

    } finally {
      setLoadingCheckpoint(false);
    }
  };

  const handleSubmitProsesBBM = async () => {
    setLoading(true)
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
    formData.append('reservasi_id', row?.id?.toString() || '');
    formData.append('fileImage', {
      uri: uri,
      name: 'spidometer-capture.jpg',
      type: 'image/jpeg',
    } as any);

    console.log('formData', formData);

    try {
      const response = await secureApi.postForm('/checkpoint/save', formData)

      console.log('response ', JSON.stringify(response));

      if (response.status == true) {
        fetchDataCheckpointAktif('');
      } else {
        Alert.alert('Peringatan!', response.message, [
          { text: 'Tutup', onPress: () => null },
        ]);
      }

    } catch (error: any) {
      console.log('response checkpoint', JSON.stringify(error.response.data));
      Alert.alert('Warning!', error.response.data.message, [
        { text: 'Tutup', onPress: () => null },
      ]);

    } finally {
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
  }

  const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0
  const keyboardBehavior = Platform.OS === 'ios' ? 'padding' : 'height'

  return (
    <SafeAreaView noTop>
      <View className="flex-1 bg-slate-300">

        <View className='absolute w-full bg-[#205781] h-44 rounded-br-[50]  rounded-bl-[50]' />

        <KeyboardAvoidingView className="flex-1" behavior={keyboardBehavior} keyboardVerticalOffset={keyboardVerticalOffset}>
          {row ? (
            <View className="m-4 p-4 bg-[#F2E5BF] rounded-lg">
              <View className="items-center mb-3 py-2">
                <Text className="text-2xl text-center font-bold">Active</Text>
                <View className="border border-b-2 w-full mb-4 mt-2" />
                <Text className="text-5xl text-center font-bold">{row?.name}</Text>
                <Text className="font-medium text-center mt-3">{row?.no_polisi}</Text>
              </View>
            </View>
          ) : (
            <View className="m-4 p-4 bg-white rounded-lg">
              <View className="items-center mb-3 py-2">
                <Text className="text-2xl text-center font-bold">No Active</Text>
                <View className="border border-b-2 w-full mb-4 mt-2" />
              </View>
            </View>
          )}

          {loadingCheckpoint ? <SkeletonList loop={2} /> :
            checkpointStatus ? <CheckpointScreen reservasiID={checkpointID} /> :
              (
                <View className='px-4'>
                  <ScrollView style={{ marginBottom: 80 }}>
                    <View className="p-4 bg-white rounded-lg">
                      <ButtonCostum classname={colors.primary} title="Proses Pengisiaan BBM" onPress={() => setDialogExit(!dialogExit)} />
                      <ButtonCostum classname={colors.secondary} title="Pengembalian Kendaraan" onPress={() => router.push('pegembalian')} />
                    </View>
                  </ScrollView>
                </View>
              )}

        </KeyboardAvoidingView>
        <ModalRN
          visible={dialogExit}
          onClose={handleDialogExit}
        >
          <ModalRN.Header>
            <Text className='font-bold text-center'>Proses Pengisian BBM Kendaraan</Text>
            <Text className="text-center">Silahkan foto kondisi terkini saat melakukan proses pengisian BBM
              Kendaraan</Text>
          </ModalRN.Header>
          <ModalRN.Content>
            {!uri ? (
              <TouchableOpacity className="py-1 px-3 my-3 rounded-lg items-center justify-center flex-row bg-indigo-500" onPress={() => setDialogCamera(true)}>
                <AntDesign name="camera" size={32} />
                <Text className="font-bold text-white ms-2">Open Camera</Text>
              </TouchableOpacity>
            ) : (
              <View className="w-full rounded-lg bg-black">
                <Image
                  source={{ uri: uri || undefined }}
                  className='w-full aspect-[3/4] rounded-lg'
                />
                <TouchableOpacity className="absolute right-2 top-2" onPress={() => setUri(null)}>
                  <AntDesign name="closecircleo" size={32} color="red" />
                </TouchableOpacity>
              </View>
            )}
          </ModalRN.Content>
          <ModalRN.Footer>
            <View className="gap-2 flex-row">
              <ButtonCostum classname={colors.warning} title="Exit" onPress={handleDialogExit} />
              {uri && <ButtonCostum classname={colors.primary} title="Submit" onPress={handleSubmitProsesBBM} />}

            </View>
          </ModalRN.Footer>
        </ModalRN>
        <ModalCamera visible={dialogCamera} onClose={() => setDialogCamera(false)} setUriImage={(e) => setUri(e)} />
      </View>
    </SafeAreaView>
  );
}
