import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/constants/colors';

interface Props {
  /** Toggle visibility (mounted only when true). */
  visible: boolean;
  /** Headline text (default: "Memproses..."). */
  message?: string;
  /** Sub-line below the headline (default: "Mohon tunggu sebentar"). */
  hint?: string;
  /** Override accent color used by the spinner / pulse ring. */
  accent?: string;
}

/**
 * Full-screen blocking overlay for in-flight network operations
 * (POST / GET / file upload). Renders an ActivityIndicator wrapped in a
 * pulsing brand-coloured ring with a customizable message.
 *
 * Usage:
 *
 * ```tsx
 * const [submitting, setSubmitting] = useState(false);
 * // ...
 * <SubmitOverlay visible={submitting} message="Menyimpan pemakaian..." />
 * ```
 *
 * Designed to be mounted at the root of a screen (sibling to ScrollView /
 * KeyboardAwareScreen) so it overlays everything including the native
 * stack header.
 */
export default function SubmitOverlay({
  visible,
  message = 'Memproses...',
  hint = 'Mohon tunggu sebentar',
  accent = colors.brand,
}: Props) {
  // Pulse ring animation (continuous while overlay is visible).
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      pulse.value = 0;
      return;
    }
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 0 })),
      -1,
      false
    );
  }, [visible, pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.6 }],
    opacity: 0.5 - pulse.value * 0.5,
  }));

  if (!visible) return null;

  return (
    <View pointerEvents="auto" style={styles.backdrop}>
      <View style={styles.panel}>
        <View style={styles.spinnerStage}>
          <Animated.View style={[styles.pulseRing, { backgroundColor: accent }, ringStyle]} />
          <View style={[styles.spinnerCore, { backgroundColor: accent }]}>
            <ActivityIndicator color="white" size="small" />
          </View>
        </View>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  panel: {
    minWidth: 220,
    paddingHorizontal: 28,
    paddingVertical: 24,
    backgroundColor: 'white',
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  spinnerStage: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  pulseRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  spinnerCore: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
  },
  hint: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});
