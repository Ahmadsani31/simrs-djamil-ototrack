import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Linking,
  Pressable,
  Modal,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import ButtonCostum from './ButtonCostum';
import { colors } from '@/constants/colors';
const { width, height } = Dimensions.get('window');
const SCAN_SIZE = width * 0.7;
const SCAN_PADDING = 20;

export default function BarcodeScannerCamera({
  onScan,
  visible,
  onVisible,
}: {
  onScan: (data: string) => void;
  visible: boolean;
  onVisible: () => void;
}) {
  const [scanned, setScanned] = useState(false);
  const [flashlight, setFlashlight] = useState(false);
  const scanLinePos = useRef(new Animated.Value(0)).current;

  const [permission, requestPermission] = useCameraPermissions();

  // Animasi garis scan
  useEffect(() => {
    const animateScanLine = () => {
      scanLinePos.setValue(0);
      Animated.loop(
        Animated.timing(scanLinePos, {
          toValue: SCAN_SIZE,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    };

    animateScanLine();
  }, [visible]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    onScan(data);
  };

  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings(); // Android
    }
  };

  // Permission kamera
  if (!permission) {
    // Camera permissions are still loading.
    return (
      <View className="w-full flex-1 items-center justify-center bg-white">
        <Text className="text-xl font-medium">Requesting camera permission...</Text>
      </View>
    );
  }

  if (permission.status === 'denied') {
    return (
      <View className="w-full flex-1 items-center justify-center bg-white">
        <Text className="text-center text-xl font-bold text-red-500">
          Permission denied!, Please allow your permission camera
        </Text>
        <ButtonCostum
          classname={colors.secondary}
          onPress={() => openAppSettings()}
          title="Grant permission"
        />
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View className="w-full flex-1 items-center justify-center bg-white">
        <Text className="text-xl font-medium">We need your permission to show the camera</Text>
        <ButtonCostum
          classname={colors.secondary}
          onPress={() => requestPermission()}
          title="Grant permission"
        />
      </View>
    );
  }

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onVisible}>
      <View className="flex-1 justify-end bg-black/30">
        <View
          style={{
            height: height - 100,
          }}
          className={`items-center rounded-t-2xl bg-gray-500`}>
          <TouchableOpacity
            className="mb-10 h-10 w-full flex-row items-center justify-center rounded-t-2xl bg-gray-200"
            onPress={onVisible}>
            <AntDesign name="downcircle" size={18} color="black" />
            <Text className="ms-2 font-bold text-black">Tutup</Text>
          </TouchableOpacity>
          <Text className="self-center text-center text-xl font-bold text-white">
            Arahkan kamera ke barcode kedaraan yang akan digunakan.
          </Text>
          <View className="mt-10 items-center justify-center">
            {visible && (
              <CameraView
                style={{
                  width: 260,
                  height: 260,
                  borderRadius: 10,
                }}
                zoom={0.2}
                facing="back"
                ratio="1:1"
                autofocus="on"
                enableTorch={flashlight}
                barcodeScannerSettings={{
                  barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              />
            )}
            {/* Frame Scanner */}
            <View style={styles.scanFrame}>
              {/* Corner Borders */}
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />

              {/* Animated Scan Line */}
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [
                      {
                        translateY: scanLinePos.interpolate({
                          inputRange: [0, SCAN_SIZE],
                          outputRange: [0, SCAN_SIZE],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>
          </View>

          <TouchableOpacity
            className="mt-20 rounded-full bg-black p-5"
            onPress={() => setFlashlight(!flashlight)}>
            <MaterialIcons
              name={flashlight ? 'flashlight-on' : 'flashlight-off'}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlaySection: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Hitam transparan 50%
  },
  middleRow: {
    flexDirection: 'row',
    height: SCAN_SIZE + SCAN_PADDING * 2,
  },
  scanFrame: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'transparent',
    position: 'absolute',
  },
  corner: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 10,
    borderColor: '#fff',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 10,
    borderLeftWidth: 10,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 10,
    borderRightWidth: 10,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 10,
    borderLeftWidth: 10,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 10,
    borderRightWidth: 10,
  },
  scanLine: {
    position: 'absolute',
    width: SCAN_SIZE - 10,
    left: 5,
    height: 2,
    backgroundColor: '#3B82F6',
  },
});
