import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { View, Modal, TouchableOpacity, StyleSheet, Text, Dimensions } from 'react-native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
// import Marker, { ImageFormat, Position, TextBackgroundType } from 'react-native-image-marker';
import ButtonCostum from './ButtonCostum';
import LoadingIndikator from './LoadingIndikator';
import { Toast } from 'toastify-react-native';
import dayjs from 'dayjs';
import { useAuthStore } from '@/stores/authStore';
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

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export default function ModalCamera({ visible, onClose, setUriImage }: InputProps) {
  const { user } = useAuthStore();

  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);
  const [flashlight, setFlashlight] = useState(false);
  // const [location, setLocation] = useState<LocationData | null>(null);

  // useEffect(() => {
  //   getCurrentLocation();
  // }, []);

  const takePicture = async () => {
    setLoading(true);
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.6 });
    // await manipulatorImage(photo?.uri ?? null);
    // console.log(photo);

    setUriImage(photo?.uri ?? null);
    setLoading(false);
    onClose();
  };

  // const getCurrentLocation = async () => {
  //   try {
  //     const { status } = await Location.getForegroundPermissionsAsync();
  //     if (status === 'granted') {
  //       const currentLocation = await Location.getCurrentPositionAsync({
  //         accuracy: Location.Accuracy.High,
  //       });

  //       const { latitude, longitude } = currentLocation.coords;

  //       // Reverse geocoding to get address
  //       const reverseGeocoding = await Location.reverseGeocodeAsync({
  //         latitude,
  //         longitude,
  //       });

  //       const address = reverseGeocoding[0]
  //         ? `${reverseGeocoding[0].street || ''} ${reverseGeocoding[0].city || ''}, ${reverseGeocoding[0].region || ''}`.trim()
  //         : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

  //       setLocation({
  //         latitude,
  //         longitude,
  //         address,
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Error getting location:', error);
  //   }
  // };

  // const manipulatorImage = async (urlImage: string | null) => {
  //   const datetime = new Date();
  //   const text = `📍 ${user?.name} \n🕒 ${dayjs(datetime).format('dddd ,DD MMMM YYYY | HH:ss')}`;
  //   // const text = `📍 ${location?.address} \n🕒 ${dayjs(datetime).format('dddd ,DD MMMM YYYY | HH:ss')}`;

  //   try {
  //     const options = {
  //       // background image
  //       backgroundImage: {
  //         src: urlImage,
  //         scale: 1,
  //       },
  //       watermarkTexts: [
  //         {
  //           text: text,
  //           position: {
  //             position: Position.bottomLeft,
  //           },
  //           style: {
  //             color: '#fff',
  //             fontSize: 80,
  //             fontName: 'Arial',
  //             textBackgroundStyle: {
  //               paddingX: 30,
  //               paddingY: 30,
  //               type: TextBackgroundType.stretchX,
  //               color: '#15192399',
  //             },
  //           },
  //         },
  //       ],
  //       scale: 1,
  //       quality: 100,
  //       filename: 'oto-track-djmail',
  //       saveFormat: ImageFormat.jpg,
  //     };
  //     const path = await Marker.markText(options);
  //     console.log('path', path);
  //     setUriImage('file:' + path);
  //   } catch (error) {
  //     Toast.show({
  //       type: 'error',
  //       text1: 'Error capture',
  //       text2: JSON.stringify(error),
  //     });
  //   }
  // };

  return (
    <>
      <Modal visible={visible} animationType="fade">
        {loading && <LoadingIndikator />}

        <View className="flex-1 items-center justify-center bg-slate-600 ">
          {permission?.granted ? (
            <>
              <CameraView
                style={styles.camera}
                mirror={true}
                ratio={'4:3'}
                facing="back"
                autofocus="on"
                enableTorch={flashlight}
                ref={cameraRef}
              />

              {/* Bottom controls */}
              <View className="absolute bottom-0 w-full items-center bg-black/50 p-24">
                <View style={styles.bottomOverlay}>
                  <TouchableOpacity
                    style={styles.flipButton}
                    onPress={() => setFlashlight(!flashlight)}>
                    <MaterialIcons
                      name={flashlight ? 'flashlight-on' : 'flashlight-off'}
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={takePicture}>
                    <View style={[styles.shutterBtn]}>
                      <View
                        style={[
                          styles.shutterBtnInner,
                          {
                            backgroundColor: 'white',
                          },
                        ]}
                      />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.flipButton} onPress={onClose}>
                    <AntDesign name="closecircleo" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <View className="w-full flex-1 items-center justify-center bg-white">
              <Text className="text-2xl font-bold">Permissions needed!</Text>
              <Text className="m-8 rounded-lg bg-slate-300 p-3 text-center text-xl font-medium">
                We need your permission to show the camera please click bottom{' '}
                <Text className="font-bold">grant permission</Text> and Allow this App
              </Text>
              <ButtonCostum
                classname="bg-black"
                onPress={() => requestPermission()}
                title="grant permission"
              />
              <ButtonCostum classname="bg-red-500" onPress={onClose} title="close" />
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  shutterBtn: {
    backgroundColor: 'transparent',
    borderWidth: 5,
    borderColor: 'white',
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  camera: {
    flex: 1,
    // width: width,
    // height: CAMERA_HEIGHT,
    aspectRatio: CAMERA_RATIO,
    // justifyContent: 'space-between',
    // marginBottom: 100
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  flipButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
});
