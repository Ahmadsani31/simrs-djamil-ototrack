import React, { useState, useEffect, useRef, useCallback } from 'react';
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
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from '@expo/vector-icons';
import ButtonCostum from './ButtonCostum';
import { colors } from '@/constants/colors';
import { Toast } from 'toastify-react-native';
const { width, height } = Dimensions.get('window');
const SCAN_SIZE = width * 0.7;
const SCAN_PADDING = 20;

export default function BarcodeScanner({ onScan }: { onScan: (data: string) => void }) {
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
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    onScan(data);
  };

  const [isReady, setIsReady] = useState(false);

  const handleReady = useCallback(() => {
    console.log('ready');

    setIsReady(true);
  }, []);

  const handleMountError = useCallback((e: { message?: string }) => {
    Toast.show({
      position: 'center',
      type: 'error',
      text1: 'Camera Error!',
      text2: e.message,
      backgroundColor: '#000',
      textColor: '#fff',
    });
    setIsReady(false);
    // (opsional) kirim log ke error tracker di sini
  }, []);

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
    <View className="flex-1 items-center">
      <Text className="self-center text-center text-xl font-bold text-white">
        Arahkan kamera ke barcode kedaraan yang akan digunakan.
      </Text>
      <View className="mt-10 items-center justify-center">
        <CameraView
          style={{
            width: 260,
            height: 260,
            borderRadius: 10,
          }}
          zoom={0.3}
          facing="back"
          // ratio="1:1"
          enableTorch={flashlight}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          onCameraReady={handleReady}
          onMountError={handleMountError}
        />

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
    borderRadius: 5,
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
    width: SCAN_SIZE - 20,
    left: 10,
    height: 5,
    backgroundColor: '#3B82F6',
  },
});
