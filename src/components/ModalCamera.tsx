import { CameraView } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign, FontAwesome6 } from '@expo/vector-icons';

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

  const cameraRef = useRef<CameraView | null>(null);

  const takePicture = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ imageType: "png", base64: true });
    console.log('photo', photo?.uri);
    setUriImage(photo?.uri ?? null);
    onClose();
  };

  return (
    <View>
      <Modal
        visible={visible}
        animationType="fade"
      >

        <View className="flex-1 bg-slate-600 justify-center items-center ">
          <CameraView
            style={{
              flex: 1,
              width: "100%",
            }}
            ratio={"4:3"}
            facing="front"
            ref={cameraRef} >

            <View className="absolute bottom-4 w-full p-12 flex-row justify-between items-center">
              <TouchableOpacity onPress={onClose}>
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