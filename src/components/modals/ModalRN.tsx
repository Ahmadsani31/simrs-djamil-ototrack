import BottomSheet, {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Drop-in modal menggunakan @gorhom/bottom-sheet BottomSheetModal.
 *
 * Render di dalam React tree (bukan native portal seperti RN Modal),
 * sehingga tidak kehilangan navigation context.
 *
 * Butuh <BottomSheetModalProvider> di root layout (sudah ditambahkan).
 */
export function ModalRN({ visible, onClose, children }: ModalProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['70%', '90%'], []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      handleIndicatorStyle={{ backgroundColor: '#cbd5e1', width: 40 }}
      backgroundStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
      <BottomSheetScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled">
        {children}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

ModalRN.Header = function Header({ children }: { children: React.ReactNode }) {
  return <View style={styles.header}>{children}</View>;
};

ModalRN.Content = function Content({ children }: { children: React.ReactNode }) {
  return <View className="px-4 py-2">{children}</View>;
};

ModalRN.Footer = function Footer({ children }: { children: React.ReactNode }) {
  return <View style={styles.footer}>{children}</View>;
};

const styles = StyleSheet.create({
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: '#f8fafc',
  },
});
