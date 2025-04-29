import { Button, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useContext, useRef, useState } from "react";
import Input from "@/components/Input";
import InputArea from "@/components/InputArea";
import ButtonCostum from "@/components/ButtonCostum";
import { ModalRN } from "@/components/ModalRN";
import { CameraView } from "expo-camera";

export default function PerjalananScreen() {
  const router = useRouter();

  const [kegiatan, setKegiatan] = useState<String>('')
  const [modalVisible, setModalVisible] = useState(false);

  const cameraRef = useRef<CameraView | null>(null);

  return (
    <View className="flex-1 bg-slate-300">
      <View className='absolute w-full bg-[#60B5FF] h-44 rounded-br-[50]  rounded-bl-[50]' />
      <View className="m-4 p-4 bg-white rounded-lg">
        <View className="items-center mb-3">
          <Text className="text-3xl font-bold">Nama Kendaraan</Text>
          <Text className="font-medium">BA Nomor</Text>
        </View>



        <InputArea className="bg-gray-200" label="Kegiatan" placeholder="Jenis Kegiatan" value="" onChangeText={setKegiatan} />
        <ButtonCostum classname="bg-blue-500" title="Open Camera" onPress={() => setModalVisible(true)} />
      </View>
      <Modal
        visible={modalVisible}
        animationType="fade"
      >

        <View className="flex-1 bg-slate-600 justify-center items-center">
        <CameraView style={{
          height:'100%',
          aspectRatio:4/3
        }} ratio={"4:3"} facing="back" />

          <ButtonCostum title="close" onPress={()=>setModalVisible(false)}/>
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