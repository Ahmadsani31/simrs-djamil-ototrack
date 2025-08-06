import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';

import { AntDesign, Entypo } from '@expo/vector-icons';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalContext = React.createContext<{ onClose: () => void } | undefined>(undefined);

const { height } = Dimensions.get('window');

export function ModalRN({ visible, onClose, children }: ModalProps) {
  const [show, setShow] = useState(visible);
  const [isReady, setIsReady] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShow(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setIsReady(true));
    } else {
      setIsReady(false);
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShow(false));
    }
  }, [visible]);

  if (!show) return null;

  return (
    <ModalContext.Provider value={{ onClose }}>
      <RNModal transparent visible={true} animationType="none">
        {/* <TouchableWithoutFeedback onPress={onClose}> */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
          <Animated.View style={[styles.overlay, { opacity }]}>
            <TouchableWithoutFeedback>
              <Animated.View pointerEvents={isReady ? 'auto' : 'none'} style={styles.container}>
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ flexGrow: 1 }}>
                  {isReady ? children : null}
                </ScrollView>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </KeyboardAvoidingView>

        {/* </TouchableWithoutFeedback> */}
      </RNModal>
    </ModalContext.Provider>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '95%',
    backgroundColor: '#fff',
    borderRadius: 5,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f7f7f7',
  },
  content: {
    paddingTop: 10,
    paddingEnd: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
  footer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: '#f7f7f7',
  },
});
