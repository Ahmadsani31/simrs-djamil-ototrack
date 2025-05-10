import { ActivityIndicator, Alert, Button, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, SectionList, StyleSheet, Text, TextInput, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import ButtonCostum from "@/components/ButtonCostum";

import * as SecureStore from 'expo-secure-store';
import { colors } from "@/constants/colors";
import { ModalRN } from "@/components/ModalRN";
import * as yup from 'yup';
import { AntDesign, Entypo } from '@expo/vector-icons';
import ModalCamera from "@/components/ModalCamera";
import { reLocation } from "@/hooks/locationRequired";
import secureApi from "@/services/service";
import SafeAreaView from "@/components/SafeAreaView";
import { router, useFocusEffect } from "expo-router";
import { useLoadingStore } from "@/stores/loadingStore";
import SkeletonItem from "@/components/SkeletonItem";
import SkeletonList from "@/components/SkeletonList";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SelectDropdown from "react-native-select-dropdown";
import Input from "@/components/Input";
import dayjs from "dayjs";

const fetchData = async (reservasi_id: string) => {
  const response = await secureApi.get(`/checkpoint/bbm`, {
    params: {
      reservasi_id: reservasi_id,
    },
  });
  return response.data
};

interface Checkpoint {
  id: number;
  checkpoint_name: string;
  created_at: string;
  data: Bbm[];
}

interface Bbm {
  id: number;
  reservasi_id: string;
  checkpoint_id: string;
  checkpoint_name: string;
  jenis: string;
  uang: string;
  liter: string;
  image: string;
  created_at: string;
}

export default function CheckpointScreen({ checkpoint_id, reservasi_id }: any) {

  const queryClient = useQueryClient()

  const { data: bbm, isLoading, isError, error } = useQuery<Checkpoint[]>({
    queryKey: ['dataBbm',reservasi_id],
    queryFn: async () => await fetchData(reservasi_id),
    enabled: !!reservasi_id
  })

  const DataDropwdown = [
    'Voucher',
    'Uang',
  ];

  // console.log(JSON.stringify(bbm));

  const [dialogCamera, setDialogCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dialogBbm, setDialogBbm] = useState(false);
  const [dialogExit, setDialogExit] = useState(false);

  const [jenis, setJenis] = useState('');
  const [liter, setLiter] = useState('');
  const [uang, setUang] = useState('');

  const [uri, setUri] = useState<string | null>(null);

  const handleExitCheckpoint = async () => {
    setLoading(true)
    const coordinate = await reLocation.getCoordinate()

    if (!coordinate?.lat && coordinate?.long) {
      Alert.alert('Peringatan!', 'Error device location', [
        { text: 'Tutup', onPress: () => null },
      ]);
      return
    }

    const formData = new FormData();

    formData.append('checkpoint_id', checkpoint_id);
    formData.append('latitude', coordinate?.lat?.toString() || '');
    formData.append('longitude', coordinate?.long.toString() || '');

    try {
      await secureApi.postForm(`/checkpoint/exit`, formData)
      Alert.alert('Succesfully!', 'Berhasil keluar checkout', [
        { text: 'Tutup', onPress: () => router.replace('perjalanan') },
      ]);
    } catch (error: any) {
      console.log('error exit ', JSON.stringify(error.response.data.message));

      Alert.alert('Perhatian!', error.response.data.message, [
        { text: 'Tutup', onPress: () => null },
      ]);
    } finally {
      setLoading(false)
    }

  }

  const handleDialogBBM = () => {
    setDialogBbm(false);
    setUri(null)
    setJenis('')
    setLiter('')
    setUang('')
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
    formData.append('checkpoint_id', checkpoint_id);
    formData.append('reservasi_id', reservasi_id);
    formData.append('jenis', jenis);
    formData.append('uang', uang);
    formData.append('liter', liter);
    formData.append('fileImage', {
      uri: uri,
      name: 'spidometer-capture.jpg',
      type: 'image/jpeg',
    } as any);

    // console.log('formData', formData);

    try {
      const response = await secureApi.postForm('/checkpoint/save_fuel', formData)
      if (response.status == true) {
        Alert.alert('Successfully!', "Data berhasil tersimpan", [
          { text: 'Tutup', onPress: () => handleDialogBBM() },
        ]);
      }
      queryClient.invalidateQueries({ queryKey: ['bbm'] })
      // router.replace('perjalanan');
    } catch (error: any) {
      console.log('response checkpoint', JSON.stringify(error.response.data));
      Alert.alert('Warning!', error.response.data.message, [
        { text: 'Tutup', onPress: () => null },
      ]);

    } finally {
      setLoading(false)
    }

  }

  const [modalVisible, setModalVisible] = useState(false);
  const [imgUrl, setImgUrl] = useState<string>();

  const handleShowImage = async (url: string) => {
    await setImgUrl(url)
    setModalVisible(true)

  }

  const handleCloseImage = () => {
    setModalVisible(false)
    setImgUrl('')
  }



  return (
    <>
      <View className="p-4 bg-white rounded-lg">
        <ButtonCostum classname={colors.warning} title="Keluar Checkpoint" onPress={() => setDialogExit(true)} />
        <ButtonCostum classname={colors.primary} title="Pengisian BBM" onPress={() => setDialogBbm(true)} />
      </View>
      <Text className="font-bold mx-2 my-3">Log Pengisian BBM</Text>
      {isLoading && <SkeletonList loop={5} />}
      {bbm?.map((item, i) => (
        <>
          <View key={i} className="flex-row p-4 bg-[#F2E5BF] mb-2 rounded-lg justify-between items-center">
            <Text className="font-bold">{item.checkpoint_name}</Text>
            <Text>{dayjs(item.created_at).format('dddd ,DD MMMM YYYY')}</Text>
          </View>
          {item.data.map((itx, ii) => (
            <View key={ii}>
              <View className="p-4 bg-white rounded-lg mb-3">
                <Text>{ii + 1}. Pengisiian BBM</Text>
                <View className="flex-row">
                  <Text>{itx.jenis}</Text>
                  <Text>{itx.jenis == 'Voucher' ? ` : ${itx.liter} Liter` : `Nominal Rp.${parseFloat(Number(itx.uang).toFixed(2)).toLocaleString()}`}</Text>
                </View>
                <View>
                  <TouchableHighlight onPress={() => handleShowImage(itx.image)} className='p-1 bg-gray-300 rounded-lg '>
                    <View className='flex-row items-center'>
                      <Entypo name="images" size={24} color="black" />
                      <Text className='ms-5 text-center'>show image</Text>
                    </View>
                  </TouchableHighlight>
                </View>
              </View>
            </View>
          ))}
        </>
      ))}
      <ModalRN
        visible={dialogExit}
        onClose={()=>setDialogExit(false)}
      >
        <ModalRN.Header>
          <Text className='font-bold text-2xl text-center'>Perhatian!</Text>
        </ModalRN.Header>
        <ModalRN.Content>
          <Text>Apakah kamu yakin ingin keluar dalam proses pengisian BBM?</Text>
        </ModalRN.Content>
        <ModalRN.Footer>
          <View className="gap-2 flex-row">
            <ButtonCostum classname={colors.warning} title="Exit" loading={loading} onPress={()=>setDialogExit(false)} />
            <ButtonCostum classname="bg-red-500" title="Keluar" loading={loading} onPress={handleExitCheckpoint} />
          </View>
        </ModalRN.Footer>
      </ModalRN>
      <ModalRN
        visible={dialogBbm}
        onClose={handleDialogBBM}
      >
        <ModalRN.Header>
          <Text className='font-bold text-xl text-center'>Pengisian BBM Kendaraan</Text>
          <Text className="text-center">Silahkan foto struck atau bon pembelian BBM Kendaraan sebagai bukti
          </Text>
        </ModalRN.Header>
        <ModalRN.Content>
          <View className="my-3">
            <SelectDropdown
              data={DataDropwdown}
              defaultValue={jenis}
              onSelect={(selectedItem, index) => {
                setJenis(selectedItem);
              }}
              renderButton={(selectedItem, isOpen) => {
                return (
                  <View className="items-center justify-center bg-slate-300 py-4 rounded-lg">
                    <Text>{selectedItem || 'Pilih Jenis Pengisian'}</Text>
                  </View>
                );
              }}
              renderItem={(item, index, isSelected) => {
                return (
                  <View
                    style={{
                      ...styles.dropdownItemStyle,
                      ...(isSelected && { backgroundColor: '#D2D9DF' }),
                    }}>
                    <Text>{item}</Text>
                  </View>
                );
              }}
              dropdownStyle={styles.dropdownMenuStyle}
            />
          </View>
          {jenis === 'Voucher' ? (
            <Input
              className="bg-gray-200"
              label="Liter"
              placeholder="Liter"
              inputMode={'numeric'}
              value={liter || ''}
              onChangeText={setLiter}
            />
          ) : null}
          {jenis === 'Uang' ? (
            <Input
              className="bg-gray-200"
              label="Uang"
              placeholder="Nominal"
              inputMode={'numeric'}
              value={uang || ''}
              onChangeText={setUang}
            />
          ) : null}
          {!uri ? (
            <>
              <TouchableOpacity className="py-1 px-3 my-3 rounded-lg items-center justify-center flex-row bg-indigo-500" onPress={() => setDialogCamera(true)}>
                <AntDesign name="camera" size={32} />
                <Text className="font-bold text-white ms-2">Open Camera</Text>
              </TouchableOpacity>
            </>
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
            <ButtonCostum classname={colors.warning} title="Exit" loading={loading} onPress={handleDialogBBM} />
            {uri && <ButtonCostum classname={colors.primary} title="Submit" loading={loading} onPress={handleSubmitProsesBBM} />}

          </View>
        </ModalRN.Footer>
      </ModalRN>
      <ModalRN visible={modalVisible} onClose={() => handleCloseImage()}>
        <ModalRN.Header>
          <Text className="font-bold">Image</Text>
          <Text>Bon / Struck pembelian BBM</Text>
        </ModalRN.Header>
        <ModalRN.Content>
          <Image
            className='w-full aspect-[3/4] rounded-lg'
            source={{
              uri: imgUrl
            }} />
        </ModalRN.Content>
        <ModalRN.Footer>
          <TouchableOpacity onPress={() => handleCloseImage()}>

            <Text className={`py-2 px-4 bg-red-500 items-center rounded-lg text-white`}>Close</Text>
          </TouchableOpacity>
        </ModalRN.Footer>
      </ModalRN>
      <ModalCamera visible={dialogCamera} onClose={() => setDialogCamera(false)} setUriImage={(e) => setUri(e)} />
    </>
  );
}

const styles = StyleSheet.create({

  dropdownMenuStyle: {
    backgroundColor: '#E9ECEF',
    borderRadius: 8,
  },
  dropdownItemStyle: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#B1BDC8',
  }
});