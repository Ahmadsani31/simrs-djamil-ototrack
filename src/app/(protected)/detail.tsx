import { Alert, BackHandler, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import {  useEffect, useState } from "react";
import Input from "@/components/Input";
import InputArea from "@/components/InputArea";
import ButtonCostum from "@/components/ButtonCostum";
import { AntDesign } from '@expo/vector-icons';
import { Image } from "expo-image";
import ModalCamera from "@/components/ModalCamera";
import SafeAreaView from "@/components/SafeAreaView";

export default function DetailScreen() {
  const { data } = useLocalSearchParams();

  const [kegiatan, setKegiatan] = useState<string>('')
  const [modalVisible, setModalVisible] = useState(false);

  const [uri, setUri] = useState<String | null>(null);

  const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;
  const keyboardBehavior = Platform.OS === 'ios' ? 'padding' : 'height';

  const backAction = () => {
    Alert.alert('Peringatan!', 'Apakah Kamu yakin ingin membatalkan proses pemakaian kendaraan?', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel',
      },
      {text: 'YES', onPress: () => router.back()},
    ]);
    return true;
  };

  useEffect(() => {


    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);


  return (

    <SafeAreaView className="flex-1 bg-slate-300">
      <View className='absolute w-full bg-[#60B5FF] h-44 rounded-br-[50]  rounded-bl-[50]' />
      <KeyboardAvoidingView className="flex-1 mt-16" behavior={keyboardBehavior} keyboardVerticalOffset={keyboardVerticalOffset}>
        <ScrollView style={{ marginBottom: 80 }}>
          <View className="m-4 p-4 bg-white rounded-lg">
            <View className="items-center mb-3">
              <Text className="text-3xl font-bold">Nama Kendaraan</Text>
              <Text className="font-medium text-center">{JSON.stringify(data, null, "")}</Text>
            </View>
            <InputArea className="bg-gray-200" label="Kegiatan" placeholder="Jenis Kegiatan" value={kegiatan} onChangeText={setKegiatan} />
            {!uri ? (
              <TouchableOpacity className="py-1 px-3 my-3 rounded-lg items-center justify-center flex-row bg-amber-500" onPress={() => setModalVisible(true)}>
                <AntDesign name="camera" size={32} />
                <Text className="font-bold text-white ms-2">Open Camera</Text>
              </TouchableOpacity>
            ) : (
              <View className="w-full rounded-lg bg-black my-4">
                <Image
                  source={{ uri }}
                  contentFit="contain"
                  style={{ aspectRatio: 1, resizeMode: 'contain' }}
                />
                <TouchableOpacity className="absolute right-2 top-2" onPress={() => setUri(null)}>
                  <AntDesign name="closecircleo" size={32} color="red" />
                </TouchableOpacity>
              </View>
            )}
            <Input className="bg-gray-200" label="Spidometer" placeholder="Angka spidometer" inputMode={'numeric'} value="" onChangeText={setKegiatan} />
            <ButtonCostum classname="bg-indigo-500" title="Submit" />
            <ButtonCostum classname="bg-red-500" title="Kembali" onPress={backAction} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <ModalCamera visible={modalVisible} onClose={() => setModalVisible(false)} setUriImage={(e) => setUri(e)} />
    </SafeAreaView>

  );
}
