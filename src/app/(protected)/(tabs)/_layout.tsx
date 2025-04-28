import { Tabs } from 'expo-router';
import { PrivateRoute } from '@/components/PrivateRoute';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


export default function TabsLayout() {
  return (
    <PrivateRoute>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: 'teal',
          tabBarStyle: {
            position: 'absolute',
            bottom: 20,
            height: 20,
            marginLeft: 20,
            marginRight: 20,
            borderRadius: 20,
            backgroundColor: '#06202B',
            shadowRadius: 10,
            borderTopWidth: 0,
            shadowOffset: { width: 0, height: 10 },
          },
          headerStyle: {
            backgroundColor: '#60B5FF',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#fff',
          },
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarButton: (props) => <AnimatedTabButton {...props} icon="home-outline" label='Home' />,
          }}
        />
        <Tabs.Screen
          name="perjalanan"
          options={{
            title: 'Perjalanan',
            tabBarButton: (props) => <AnimatedTabButton {...props} icon="document-attach-outline" label='Home' />,
          }}
        />
        <Tabs.Screen
          name="kendaraan"
          options={{
            title: 'Kendaraan',
            tabBarButton: (props) => <AnimatedTabButton {...props} icon="car-outline" label='Home' />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarButton: (props) => <AnimatedTabButton {...props} icon="person-outline" label="Profil" />,

          }}
        />
      </Tabs>
    </PrivateRoute>
  );
}

function AnimatedTabButton({ icon, label, accessibilityState, onPress }: any) {
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
        marginBottom: 30,
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
            backgroundColor: '#077A7D',
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        />
        {/* Icon */}
        <Ionicons name={icon} size={28} color={focused ? '#fff' : '#000'} />
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
}
