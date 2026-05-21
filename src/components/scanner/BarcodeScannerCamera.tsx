import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Linking,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Toast } from 'toastify-react-native';

const { width, height } = Dimensions.get('window');
const SCAN_SIZE = Math.min(width * 0.72, 320);

interface Props {
  onScan: (data: string) => void;
  visible: boolean;
  onVisible: () => void;
  /**
   * True saat parent sedang memvalidasi hasil scan ke server. Scanner akan
   * menampilkan overlay loading dan mencegah re-scan sampai parent reset
   * state ini. Set false setelah API call selesai (sukses atau gagal).
   */
  validating?: boolean;
}

const openAppSettings = () => {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
};

/**
 * Generic permission state container — dipakai untuk loading / denied /
 * not-granted screens supaya konsisten.
 */
function PermissionState({
  visible,
  onClose,
  icon,
  iconColor,
  title,
  message,
  primaryLabel,
  onPrimary,
}: {
  visible: boolean;
  onClose: () => void;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  title: string;
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
}) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/85 px-6">
        <View className="w-full items-center rounded-3xl bg-white p-6">
          <View className="mb-4 rounded-full bg-slate-100 p-4">
            <MaterialCommunityIcons name={icon} size={36} color={iconColor} />
          </View>
          <Text className="mb-2 text-center text-lg font-bold text-gray-800">{title}</Text>
          <Text className="mb-5 text-center text-sm leading-5 text-gray-500">{message}</Text>
          <View className="w-full flex-row gap-2">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              className="flex-1 rounded-xl bg-slate-100 py-3">
              <Text className="text-center text-sm font-semibold text-gray-700">Tutup</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onPrimary}
              className="flex-1 rounded-xl bg-brand py-3">
              <Text className="text-center text-sm font-bold text-white">{primaryLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function BarcodeScannerCamera({
  onScan,
  visible,
  onVisible,
  validating = false,
}: Props) {
  const [scanned, setScanned] = useState(false);
  const [flashlight, setFlashlight] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // Animasi scan line: bolak-balik atas-bawah secara mulus.
  const scanLineY = useSharedValue(0);
  // Pulse effect saat berhasil scan (menandakan capture sukses).
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    setScanned(false);
    scanLineY.value = 0;
    scanLineY.value = withRepeat(
      withSequence(
        withTiming(SCAN_SIZE - 4, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    return () => {
      cancelAnimation(scanLineY);
    };
  }, [visible, scanLineY]);

  // Saat parent selesai validasi (validating: true → false) dan modal masih
  // terbuka, reset state biar user bisa scan ulang tanpa close-buka modal.
  useEffect(() => {
    if (!visible) return;
    if (!validating && scanned) {
      setScanned(false);
      scanLineY.value = 0;
      scanLineY.value = withRepeat(
        withSequence(
          withTiming(SCAN_SIZE - 4, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validating]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    cancelAnimation(scanLineY);

    // Pulse success animation
    pulseOpacity.value = withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(0, { duration: 350 })
    );
    pulseScale.value = withSequence(
      withTiming(1.08, { duration: 150 }),
      withTiming(1, { duration: 350 })
    );

    onScan(data);
  };

  const handleMountError = (e: { message?: string }) => {
    Toast.show({
      type: 'error',
      text1: 'Camera Error',
      text2: e.message ?? 'Tidak dapat memulai kamera',
    });
  };

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  const successOverlayStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  // ---- Permission states ----
  if (!permission?.granted && permission?.status !== 'denied') {
    return (
      <PermissionState
        visible={visible}
        onClose={onVisible}
        icon="camera-outline"
        iconColor="#205781"
        title="Memuat izin kamera..."
        message="Tunggu sebentar sambil aplikasi memeriksa izin kamera."
        primaryLabel="Buka Pengaturan"
        onPrimary={openAppSettings}
      />
    );
  }

  if (permission.status === 'denied' && !permission.canAskAgain) {
    return (
      <PermissionState
        visible={visible}
        onClose={onVisible}
        icon="camera-off-outline"
        iconColor="#ef4444"
        title="Izin Kamera Diblokir"
        message="Aktifkan izin kamera di pengaturan aplikasi untuk memindai QR kendaraan."
        primaryLabel="Buka Pengaturan"
        onPrimary={openAppSettings}
      />
    );
  }

  if (!permission.granted) {
    return (
      <PermissionState
        visible={visible}
        onClose={onVisible}
        icon="camera-outline"
        iconColor="#205781"
        title="Akses Kamera Diperlukan"
        message="Aplikasi membutuhkan kamera untuk memindai QR kendaraan."
        primaryLabel="Berikan Izin"
        onPrimary={() => requestPermission()}
      />
    );
  }

  // ---- Scanner UI ----
  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={validating ? undefined : onVisible}
      statusBarTranslucent>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      <View className="flex-1 bg-black">
        {visible && (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            autofocus="on"
            enableTorch={flashlight}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            onMountError={handleMountError}
          />
        )}

        {/* Dark mask with center cutout */}
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {/* top */}
          <View style={[styles.mask, { height: (height - SCAN_SIZE) / 2 }]} />
          {/* middle row */}
          <View style={{ flexDirection: 'row', height: SCAN_SIZE }}>
            <View style={[styles.mask, { width: (width - SCAN_SIZE) / 2 }]} />
            <View style={{ width: SCAN_SIZE, height: SCAN_SIZE }} />
            <View style={[styles.mask, { width: (width - SCAN_SIZE) / 2 }]} />
          </View>
          {/* bottom */}
          <View style={[styles.mask, { flex: 1 }]} />
        </View>

        {/* Top header */}
        <View
          style={{
            paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 24) + 16,
          }}
          className="absolute left-0 right-0 top-0 px-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-base font-bold text-white">Pindai QR Kendaraan</Text>
              <Text className="mt-0.5 text-xs text-white/70">Arahkan kamera ke kode QR</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={validating}
              onPress={onVisible}
              className={`rounded-full p-2.5 ${validating ? 'bg-white/5' : 'bg-white/15'}`}
              hitSlop={8}>
              <Feather name="x" size={20} color={validating ? 'rgba(255,255,255,0.4)' : 'white'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Center scan window */}
        <View
          pointerEvents="none"
          style={[
            styles.center,
            {
              top: (height - SCAN_SIZE) / 2,
              left: (width - SCAN_SIZE) / 2,
              width: SCAN_SIZE,
              height: SCAN_SIZE,
            },
          ]}>
          {/* Corner brackets */}
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />

          {/* Animated scan line */}
          {!scanned && (
            <Animated.View style={[styles.scanLine, scanLineStyle]}>
              <View style={styles.scanLineGlow} />
            </Animated.View>
          )}

          {/* Success pulse overlay */}
          <Animated.View style={[styles.successOverlay, successOverlayStyle]}>
            <View className="rounded-full bg-emerald-500 p-4">
              <Feather name="check" size={36} color="white" />
            </View>
          </Animated.View>
        </View>

        {/* Bottom controls */}
        <View
          style={{
            paddingBottom: Platform.OS === 'ios' ? 36 : 24,
          }}
          className="absolute bottom-0 left-0 right-0 px-6">
          {/* Hint card */}
          <View className="mb-4 flex-row items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
            <View className="rounded-full bg-white/15 p-1.5">
              <Feather name="info" size={14} color="white" />
            </View>
            <Text className="flex-1 text-xs text-white/80">
              Pastikan QR berada dalam kotak pemindaian dan cukup terang.
            </Text>
          </View>

          {/* Action row */}
          <View className="flex-row items-center justify-center gap-4">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setFlashlight((v) => !v)}
              className={`h-14 w-14 items-center justify-center rounded-full ${
                flashlight ? 'bg-amber-400' : 'bg-white/15'
              }`}>
              <MaterialCommunityIcons
                name={flashlight ? 'flashlight' : 'flashlight-off'}
                size={22}
                color={flashlight ? '#1f2937' : 'white'}
              />
            </TouchableOpacity>

            {scanned && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setScanned(false)}
                className="flex-row items-center gap-2 rounded-full bg-emerald-500 px-5 py-3">
                <Feather name="refresh-cw" size={16} color="white" />
                <Text className="text-sm font-bold text-white">Pindai Lagi</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Validating overlay — block UI saat parent verifikasi QR ke server */}
        {validating ? <ValidatingOverlay /> : null}
      </View>
    </Modal>
  );
}

/**
 * Animated overlay yang muncul saat parent sedang memvalidasi QR ke server.
 * Tiga lingkaran konsentris pulse dengan staggered delay → kasih perasaan
 * proses sedang berjalan, bukan freeze.
 */
function ValidatingOverlay() {
  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);
  const ring3 = useSharedValue(0);

  useEffect(() => {
    const cfg = { duration: 1500, easing: Easing.out(Easing.ease) };
    ring1.value = withRepeat(withTiming(1, cfg), -1, false);
    ring2.value = withRepeat(
      withSequence(withTiming(0, { duration: 500 }), withTiming(1, cfg)),
      -1,
      false
    );
    ring3.value = withRepeat(
      withSequence(withTiming(0, { duration: 1000 }), withTiming(1, cfg)),
      -1,
      false
    );
    return () => {
      cancelAnimation(ring1);
      cancelAnimation(ring2);
      cancelAnimation(ring3);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ringStyle = (sv: SharedValue<number>) => ({
    transform: [{ scale: 1 + sv.value * 1.4 }],
    opacity: 0.4 - sv.value * 0.4,
  });

  const ring1Style = useAnimatedStyle(() => ringStyle(ring1));
  const ring2Style = useAnimatedStyle(() => ringStyle(ring2));
  const ring3Style = useAnimatedStyle(() => ringStyle(ring3));

  return (
    <View style={[StyleSheet.absoluteFill, styles.validatingOverlay]}>
      <View style={styles.validatingPanel}>
        {/* Pulsing rings */}
        <View style={styles.ringStage}>
          <Animated.View style={[styles.ring, ring1Style]} />
          <Animated.View style={[styles.ring, ring2Style]} />
          <Animated.View style={[styles.ring, ring3Style]} />
          <View style={styles.ringCore}>
            <Feather name="check" size={28} color="white" />
          </View>
        </View>

        <Text className="mt-6 text-base font-bold text-white">Memvalidasi QR...</Text>
        <Text className="mt-1 text-xs text-white/70">
          Mohon tunggu, kami sedang memverifikasi kendaraan
        </Text>
      </View>
    </View>
  );
}

const MASK_COLOR = 'rgba(0,0,0,0.7)';
const CORNER_COLOR = '#fff';
const CORNER_SIZE = 32;
const CORNER_THICKNESS = 4;

const styles = StyleSheet.create({
  mask: {
    backgroundColor: MASK_COLOR,
  },
  center: {
    position: 'absolute',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: CORNER_COLOR,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: 16,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: 16,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: 16,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: 16,
  },
  scanLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 2,
    top: 0,
  },
  scanLineGlow: {
    flex: 1,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  successOverlay: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  validatingOverlay: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  validatingPanel: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  ringStage: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10b981',
  },
  ringCore: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
