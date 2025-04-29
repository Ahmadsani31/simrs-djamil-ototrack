import { Button, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useContext, useRef, useState } from "react";
import Input from "@/components/Input";
import InputArea from "@/components/InputArea";
import ButtonCostum from "@/components/ButtonCostum";
import { CameraMode, CameraView } from "expo-camera";
import { AntDesign, FontAwesome6 } from '@expo/vector-icons';
import { Image } from "expo-image";

export default function PerjalananScreen() {
  const router = useRouter();

  const [kegiatan, setKegiatan] = useState<tring>('')
  const [modalVisible, setModalVisible] = useState(false);

  const cameraRef = useRef<CameraView | null>(null);
  const [uri, setUri] = useState<String | null>(null);

  const takePicture = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ imageType: "png", base64: true });
    console.log('photo', photo?.uri);
    setUri(photo?.uri ?? null);
    setModalVisible(false)
  };
  const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0
  const keyboardBehavior = Platform.OS === 'ios' ? 'padding' : 'height'
  return (

    <View className="flex-1 bg-slate-300">
      <View className='absolute w-full bg-[#60B5FF] h-44 rounded-br-[50]  rounded-bl-[50]' />
      <KeyboardAvoidingView  className="flex-1" behavior={keyboardBehavior} keyboardVerticalOffset={keyboardVerticalOffset}>
        <ScrollView style={{marginBottom:80}}>
          <View className="m-4 p-4 bg-white rounded-lg">
            <View className="items-center mb-3">
              <Text className="text-3xl font-bold">Nama Kendaraan</Text>
              <Text className="font-medium">BA Nomor</Text>
            </View>

            {uri && <View className="w-full rounded-lg bg-black mb-4">
              <Image
                source={{ uri }}
                contentFit="contain"
                style={{ aspectRatio: 1, resizeMode: 'contain' }}
              />
            </View>}

            <InputArea className="bg-gray-200" label="Kegiatan" placeholder="Jenis Kegiatan" value={kegiatan} onChangeText={setKegiatan} />
            <Input className="bg-gray-200" label="Spidometer" placeholder="Angka spidometer" inputMode={'numeric'} value="" onChangeText={setKegiatan} />
            <ButtonCostum classname="bg-blue-500" title="Open Camera" onPress={() => setModalVisible(true)} />
            <ButtonCostum classname="bg-indigo-500" title="Submit"/>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal
        visible={modalVisible}
        animationType="fade"
      >

        <View className="flex-1 bg-slate-600 justify-center items-center ">
          <CameraView style={{
            flex: 1,
            width: "100%",
          }} ratio={"4:3"} facing="back" ref={cameraRef} >

            <View className="absolute bottom-4 w-full p-12 flex-row justify-between items-center">
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <AntDesign name="closecircleo" size={42} color="red" />
              </TouchableOpacity>
              <TouchableOpacity onPress={takePicture}>
                  <View
                    style={[
                      styles.shutterBtn,
                    ]}
                  >
                    <View
                      style={[
                        styles.shutterBtnInner,
                        {
                          backgroundColor: "white",
                        },
                      ]}
                    />
                  </View>
              </TouchableOpacity>
            </View>
          </CameraView>


        </View>
      </Modal>
    </View>

  );
}

const styles = StyleSheet.create({

  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
});