import { useHeaderHeight } from '@react-navigation/elements';
import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

interface Props {
  children: ReactNode;
  /** Tambahan offset di atas header height (default 0). */
  extraOffset?: number;
  className?: string;
}

/**
 * Wrapper KeyboardAvoidingView yang menghitung offset secara akurat dari
 * native stack header. Gunakan di setiap screen yang punya form di bawah
 * `brandHeader()` / `brandHeaderBackLeft()` di `(protected)/_layout.tsx`.
 *
 * - iOS: `behavior="padding"` + offset = headerHeight (status bar sudah
 *   masuk hitungan headerHeight di iOS).
 * - Android: `behavior={undefined}` — biarkan native `adjustResize`
 *   (default `softwareKeyboardLayoutMode` Expo) yang resize layout.
 *   Set behavior ke `'padding'` justru bikin double-shift.
 */
export default function KeyboardAwareScreen({ children, extraOffset = 0, className }: Props) {
  const headerHeight = useHeaderHeight();

  return (
    <KeyboardAvoidingView
      className={className}
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight + extraOffset : 0}>
      {children}
    </KeyboardAvoidingView>
  );
}
