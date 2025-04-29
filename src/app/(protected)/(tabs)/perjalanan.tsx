import { Button, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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

  const [kegiatan, setKegiatan] = useState<String>('')
  const [modalVisible, setModalVisible] = useState(false);

  const cameraRef = useRef<CameraView | null>(null);
  const [uri, setUri] = useState<JSON | null>(null);

  const takePicture = async () => {
    const photo = await cameraRef.current?.takePictureAsync({imageType:"png",base64:true});
    console.log('photo', photo?.uri);
    setUri(photo?.uri);
    setModalVisible(false)
  };

  return (
    <View className="flex-1 bg-slate-300">
      <View className='absolute w-full bg-[#60B5FF] h-44 rounded-br-[50]  rounded-bl-[50]' />
      <View className="m-4 p-4 bg-white rounded-lg">
        <View className="items-center mb-3">
          <Text className="text-3xl font-bold">Nama Kendaraan</Text>
          <Text className="font-medium">BA Nomor</Text>
        </View>

        {uri && <Image
        
          source={{ uri }}
          className="ob"
          contentFit="contain"
          style={{  aspectRatio: 1 }}
        />}

        <InputArea className="bg-gray-200" label="Kegiatan" placeholder="Jenis Kegiatan" value="" onChangeText={setKegiatan} />
        <ButtonCostum classname="bg-blue-500" title="Open Camera" onPress={() => setModalVisible(true)} />
      </View>
      <Modal
        visible={modalVisible}
        animationType="fade"
      >

        <View className="flex-1 bg-slate-600 justify-center items-center ">
          <CameraView style={{
            flex: 1,
            width: "100%",
          }} ratio={"4:3"} facing="back" ref={cameraRef} >
            {/* <View className="absolute flex-row bottom-10 justify-center">
              <ButtonCostum classname="bg-stone-500 " title="close" />
              <ButtonCostum classname="bg-red-500 " title="close" onPress={() => setModalVisible(false)} />
            </View> */}
            <View style={styles.shutterContainer}>
              <Pressable>
                <AntDesign name="picture" size={32} color="white" />

              </Pressable>
              <Pressable onPress={takePicture}>
                {({ pressed }) => (
                  <View
                    style={[
                      styles.shutterBtn,
                      {
                        opacity: pressed ? 0.5 : 1,
                      },
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
                )}
              </Pressable>
            </View>
          </CameraView>

          {/* <CameraView className="flex-1" facing={'front'}>
            <View className="w-full m-96 bg-black/50">
              <TouchableOpacity onPress={()=>setModalVisible(false)}>
                <Text style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: 'white',
                }}>Flip Camera</Text>
              </TouchableOpacity>
            </View>
          </CameraView> */}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
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