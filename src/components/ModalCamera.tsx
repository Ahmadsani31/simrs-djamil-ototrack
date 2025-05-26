import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, Text, ActivityIndicator, Dimensions } from 'react-native';
import { AntDesign, FontAwesome6 } from '@expo/vector-icons';
import ButtonCostum from './ButtonCostum';
import LoadingIndikator from './LoadingIndikator';
// import {  SaveFormat, useImageManipulator } from 'expo-image-manipulator';
// import { Asset } from 'expo-asset';

const { width } = Dimensions.get('window');
const CAMERA_RATIO = 4 / 3;
const CAMERA_HEIGHT = width * CAMERA_RATIO;

interface InputProps {
  visible: boolean;
  onClose: () => void;
  setUriImage: (text: string | null) => void;
}

export default function ModalCamera({
  visible,
  onClose,
  setUriImage,
}: InputProps) {

  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);

  const takePicture = async () => {
    setLoading(true);
    const photo = await cameraRef.current?.takePictureAsync({ base64: true, quality: 0.6 });
    setUriImage(photo?.uri ?? null);
    setLoading(false);
    onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="fade"
      >
        {loading && <LoadingIndikator />}

        <View className="flex-1 bg-slate-600 justify-center items-center ">
          {permission?.granted ? (
            <>
              <CameraView
                style={styles.camera}
                mirror={true}
                ratio={"4:3"}
                facing="back"
                ref={cameraRef}
              />
                <View className="absolute top-5 right-5">
                  <TouchableOpacity onPress={onClose} className='bg-white p-1 rounded-lg flex-row gap-2 justify-center items-center'>
                    <AntDesign name="closecircleo" size={28} color="red" />
                    <Text>Tutup</Text>
                  </TouchableOpacity>
                </View>
                <View className="absolute bottom-0 w-full bg-black/50 p-16 items-center">
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
            </>

          ) :
            <View className='flex-1 w-full items-center justify-center bg-white'>
              <Text className='font-bold text-2xl'>Permissions needed!</Text>
              <Text className='font-medium text-xl bg-slate-300 p-3 m-8 text-center rounded-lg'>We need your permission to show the camera please click bottom <Text className='font-bold'>grant permission</Text>  and Allow this App</Text>
              <ButtonCostum classname='bg-black' onPress={() => requestPermission()} title="grant permission" />
              <ButtonCostum classname='bg-red-500' onPress={onClose} title="close" />
            </View>
          }

        </View>
      </Modal>
    </>
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
  camera: {
    flex: 1,
    width: width,
    height: CAMERA_HEIGHT,
    aspectRatio:CAMERA_RATIO
    // justifyContent: 'space-between',
    // marginBottom: 100
  },
});