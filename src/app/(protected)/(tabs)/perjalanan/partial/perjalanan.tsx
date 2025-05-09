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
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface dataAktif {
  id: number;
  name: string;
  no_polisi: string;
  kegiatan: string;
  created_at: string
}

export default function PerjalananScreen({ items }: any) {

  // const setLoading = useLoadingStore((state) => state.setLoading);

  const [dialogCamera, setDialogCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dialogExit, setDialogExit] = useState(false);
  const [uri, setUri] = useState<string | null>(null);

  const handleDialogExit = () => {
    setDialogExit(false);
    setUri(null)
  }

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
    formData.append('reservasi_id', items?.id?.toString() || '');
    formData.append('fileImage', {
      uri: uri,
      name: 'spidometer-capture.jpg',
      type: 'image/jpeg',
    } as any);

    // console.log('formData', formData);

    try {
      const response = await secureApi.postForm('/checkpoint/save', formData)
      router.replace('perjalanan');
    } catch (error: any) {
      console.log('response checkpoint', JSON.stringify(error.response.data));
      Alert.alert('Warning!', error.response.data.message, [
        { text: 'Tutup', onPress: () => null },
      ]);

    } finally {
      setLoading(false)
    }

  }

  return (
    <>
      <View className="p-4 bg-white rounded-lg">
        <ButtonCostum classname={colors.primary} title="Proses Pengisiaan BBM" onPress={() => setDialogExit(!dialogExit)} />
        <ButtonCostum classname={colors.secondary} title="Pengembalian Kendaraan" onPress={() => router.push({
          pathname: 'pegembalian',
          params: {
            reservasi_id: items.id,
            name: items.name,
            no_polisi: items.no_polisi,
          }
        })} />
      </View>
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
            <ButtonCostum classname={colors.warning} title="Exit"  loading={loading} onPress={handleDialogExit} />
            {uri && <ButtonCostum classname={colors.primary} title="Submit" loading={loading} onPress={handleSubmitProsesBBM} />}

          </View>
        </ModalRN.Footer>
      </ModalRN>
      <ModalCamera visible={dialogCamera} onClose={() => setDialogCamera(false)} setUriImage={(e) => setUri(e)} />
    </>
  );
}
