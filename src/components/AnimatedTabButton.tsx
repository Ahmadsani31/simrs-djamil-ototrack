import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Pressable } from 'react-native-gesture-handler';

export function AnimatedTabButton({ icon, label, accessibilityState, onPress }: any) {
  const focused = accessibilityState.selected;

  const scale = useSharedValue(0)

  useEffect(() => {
    scale.value = withSpring(
      typeof focused === "boolean" ? (focused ? 1 : 0) : focused, { duration: 350 }
    )
  }, [scale, focused]);


  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2]);
    const top = interpolate(scale.value + 1, [0, 1], [1, 0])
    return {
      transform: [
        { scale: scaleValue }
      ],
      top
    };
  })

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: 'center',
        bottom: 15
      }}
    >
      <View style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }} className={`${focused ? 'pt-0' : 'pt-4'} bg-[#BEE4D0] w-full rounded-full absolute`}>
        {/* Bulatan background */}
        <Animated.View
          style={{
            position: 'absolute',
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: focused ? '#FE7743' : '#F2E5BF',
            transform: [{ scale: focused ? 1.3 : 1, }],
          }}
        />
        {/* Icon */}
        <Animated.View style={animatedIconStyle}>
          <Ionicons name={icon} size={28} color={focused ? '#205781' : '#aaa'} />
        </Animated.View>
        {/* Label muncul jika active */}
        <Animated.Text
          style={[{
            fontSize: 12,
            color: '#fff',
            opacity: focused ? 1 : 0,

          }]}
        >
          {label}
        </Animated.Text>
      </View>
    </Pressable>
  );
}


