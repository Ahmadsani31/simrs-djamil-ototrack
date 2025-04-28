import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AnimatedTabButtonProps {
  icon: any;
  label?: string;
  accessibilityState: any;
  onPress: () => void;
}

const AnimatedTabButton: React.FC<AnimatedTabButtonProps> = ({ icon, label, accessibilityState, onPress }: any) => {
  const focused = accessibilityState.selected;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const labelAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.3 : 1,
        useNativeDriver: true,
        friction: 5,
      }),
      Animated.timing(fadeAnim, {
        toValue: focused ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(labelAnim, {
        toValue: focused ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }} className={`${focused ? 'pt-0' : 'pt-4'} bg-[#BEE4D0] w-full rounded-full`}>
        {/* Bulatan background */}
        <Animated.View
          style={{
            position: 'absolute',
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: '#077A7D',
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        />
        {/* Icon */}
        <Ionicons name={icon} size={28} color={focused ? '#fff' : '#aaa'} />
        {/* Label muncul jika active */}
        <Animated.Text
          style={{
            fontSize: 12,
            color: focused ? '#fff' : '#aaa',
            opacity: labelAnim,
            transform: [{ scale: labelAnim }],
          }}
        >
          {label}
        </Animated.Text>
      </View>
    </Pressable>
  );
};

export default AnimatedTabButton;
