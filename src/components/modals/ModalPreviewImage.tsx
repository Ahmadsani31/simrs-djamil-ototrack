import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Dimensions, Modal, Platform, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface propsImage {
  visible: boolean;
  imgUrl: string;
  title: string;
  /** Optional sub-line shown below the title (e.g. timestamp / vehicle plate). */
  subtitle?: string;
  onPress: () => void;
}

const { width, height } = Dimensions.get('window');

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const TOP_INSET = Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 24) + 16;

/**
 * Fullscreen image preview dengan pinch-to-zoom, double-tap, dan pan saat
 * di-zoom. Tap area kosong (di luar gambar) untuk close. Header & footer
 * auto-hide saat user men-zoom supaya tidak menghalangi gambar.
 */
export default function ModalPreviewImage({
  visible,
  title,
  subtitle,
  imgUrl,
  onPress,
}: propsImage) {
  const [loading, setLoading] = useState(true);
  const [chromeVisible, setChromeVisible] = useState(true);

  // Zoom + pan state
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const resetZoom = () => {
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  // Reset state saat modal close/open
  useEffect(() => {
    if (visible) {
      setLoading(true);
      setChromeVisible(true);
    } else {
      resetZoom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      runOnJS(setChromeVisible)(false);
    })
    .onUpdate((e) => {
      const next = Math.max(MIN_SCALE * 0.9, Math.min(savedScale.value * e.scale, MAX_SCALE));
      scale.value = next;
    })
    .onEnd(() => {
      if (scale.value < MIN_SCALE) {
        scale.value = withTiming(MIN_SCALE);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedScale.value = MIN_SCALE;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        runOnJS(setChromeVisible)(true);
      } else {
        savedScale.value = scale.value;
      }
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Hanya aktif saat zoomed in
      if (scale.value <= 1) return;
    })
    .onUpdate((e) => {
      if (scale.value <= 1) return;
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withTiming(1);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
        runOnJS(setChromeVisible)(true);
      } else {
        scale.value = withTiming(2);
        savedScale.value = 2;
        runOnJS(setChromeVisible)(false);
      }
    });

  const singleTapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd(() => {
      runOnJS(setChromeVisible)(!chromeVisible);
    })
    .requireExternalGestureToFail(doubleTapGesture);

  const composedGesture = Gesture.Simultaneous(
    panGesture,
    pinchGesture,
    Gesture.Exclusive(doubleTapGesture, singleTapGesture)
  );

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const chromeStyle = useAnimatedStyle(() => ({
    opacity: withTiming(chromeVisible ? 1 : 0, { duration: 180 }),
  }));

  return (
    <Modal animationType="fade" visible={visible} onRequestClose={onPress} statusBarTranslucent>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'black' }}>
        {/* Image stage */}
        <GestureDetector gesture={composedGesture}>
          <Animated.View
            style={[
              {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              },
              imageStyle,
            ]}>
            {imgUrl ? (
              <Image
                style={{ width, height: height * 0.85 }}
                source={{ uri: imgUrl }}
                contentFit="contain"
                placeholder={blurhash}
                transition={300}
                onLoadEnd={() => setLoading(false)}
              />
            ) : null}
          </Animated.View>
        </GestureDetector>

        {/* Loading indicator */}
        {loading && imgUrl ? (
          <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
            <View className="flex-row items-center gap-3 rounded-full bg-white/15 px-4 py-2.5">
              <View className="h-2 w-2 animate-pulse rounded-full bg-white" />
              <Text className="text-xs font-medium text-white/90">Memuat gambar...</Text>
            </View>
          </View>
        ) : null}

        {/* Top header (auto-hide when zoomed) */}
        <Animated.View
          pointerEvents={chromeVisible ? 'auto' : 'none'}
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              paddingTop: TOP_INSET,
              paddingHorizontal: 20,
              paddingBottom: 16,
              backgroundColor: 'rgba(0,0,0,0.55)',
            },
            chromeStyle,
          ]}>
          <View className="flex-row items-center gap-3">
            <View className="flex-1">
              <Text className="text-base font-bold text-white" numberOfLines={1}>
                {title || 'Pratinjau Foto'}
              </Text>
              {subtitle ? (
                <Text className="mt-0.5 text-xs text-white/70" numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onPress}
              hitSlop={8}
              className="rounded-full bg-white/15 p-2.5">
              <Feather name="x" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Bottom hint (auto-hide when zoomed) */}
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              bottom: Platform.OS === 'ios' ? 36 : 20,
              left: 0,
              right: 0,
              alignItems: 'center',
              paddingHorizontal: 20,
            },
            chromeStyle,
          ]}>
          <View className="flex-row items-center gap-2 rounded-full bg-white/10 px-4 py-2">
            <Feather name="zoom-in" size={12} color="rgba(255,255,255,0.8)" />
            <Text className="text-[11px] text-white/80">
              Cubit untuk zoom · Ketuk dua kali untuk perbesar
            </Text>
          </View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}
