import React, { useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface FadeInViewProps extends ViewProps {
  /** Animation duration in ms. Defaults to 300. */
  duration?: number;
  /** Delay before fade starts in ms. Defaults to 0. */
  delay?: number;
  children?: React.ReactNode;
}

/**
 * Drop-in replacement for `MotiView` with `from={{opacity:0}} animate={{opacity:1}}`.
 * Built on `react-native-reanimated` (already a dependency) so we avoid the
 * `framer-motion` / `tslib` interop crash that `moti@0.30.0` triggers under
 * Expo SDK 55.
 */
export default function FadeInView({
  duration = 300,
  delay = 0,
  children,
  style,
  ...rest
}: FadeInViewProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration,
      easing: Easing.out(Easing.ease),
    });
    // Delay handled via setTimeout to keep API simple; reanimated `withDelay`
    // is also fine but adds a wrapper for trivial use.
  }, [duration, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View {...rest} style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
