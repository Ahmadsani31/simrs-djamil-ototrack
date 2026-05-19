import React, { useEffect } from 'react';
import { DimensionValue, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';

export type SkeletonRadius = 'round' | 'square' | number;

interface SkeletonProps {
  /** Color scheme. Currently only `light` is implemented (matches old usage). */
  colorMode?: 'light' | 'dark';
  /** Height in px. */
  height: number;
  /** Width as px or percentage string. */
  width: DimensionValue;
  /** Border radius. `round` = full pill. `square` = 0. number = exact px. */
  radius?: SkeletonRadius;
}

const LIGHT_BASE = '#E5E7EB'; // gray-200
const LIGHT_HIGHLIGHT = '#F3F4F6'; // gray-100
const DARK_BASE = '#374151'; // gray-700
const DARK_HIGHLIGHT = '#4B5563'; // gray-600

/**
 * Lightweight shimmer placeholder. Drop-in replacement for `moti/skeleton`'s
 * `<Skeleton colorMode height width radius />` API as used in this repo.
 *
 * Uses `react-native-reanimated` (already a dependency) instead of pulling in
 * `moti` + `framer-motion` which crash under Expo SDK 55 due to a `tslib`
 * interop mismatch.
 */
export default function Skeleton({
  colorMode = 'light',
  height,
  width,
  radius = 'square',
}: SkeletonProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [progress]);

  const base = colorMode === 'dark' ? DARK_BASE : LIGHT_BASE;
  const highlight = colorMode === 'dark' ? DARK_HIGHLIGHT : LIGHT_HIGHLIGHT;

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [base, highlight]),
  }));

  const borderRadius =
    radius === 'round' ? height / 2 : radius === 'square' ? 0 : (radius as number);

  return (
    <View style={{ height, width, borderRadius, overflow: 'hidden' }}>
      <Animated.View style={[StyleSheet.absoluteFillObject, animatedStyle]} />
    </View>
  );
}
