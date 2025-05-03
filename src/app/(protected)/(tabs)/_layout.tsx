import { Tabs } from 'expo-router';
import { PrivateRoute } from '@/components/PrivateRoute';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Entypo, Feather, Ionicons } from '@expo/vector-icons';
import {AnimatedTabButton} from '@/components/AnimatedTabButton';


export default function TabsLayout() {
  return (
    <PrivateRoute>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: 'teal',
          headerShadowVisible: false,
          // headerTitleAlign: 'center',
          tabBarStyle: {
            position: 'absolute',
            bottom: 20,
            marginLeft: 20,
            marginRight: 20,
            borderRadius: 20,
            backgroundColor: '#205781',
            shadowRadius: 10,
            borderTopWidth: 0,
            shadowOffset: { width: 0, height: 200 },
          },
          headerStyle: {
            backgroundColor: '#205781',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#fff',
          },
          tabBarShowLabel: false,
          headerTitle: ()=>(
            <Text className='font-bold text-white text-xl'>App Tracking</Text>
          ),
          headerLeft: () => (
            <View className='px-5 flex-row items-center'>
              <Entypo name="location" size={22} color="white" /> 
            </View>
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarButton: (props) => <AnimatedTabButton {...props} icon="home-sharp" label='Home' />,
          }}
        />
        <Tabs.Screen
          name="perjalanan"
          options={{
            title: 'Perjalanan',
            tabBarButton: (props) => <AnimatedTabButton {...props} icon="speedometer-sharp" label='Job' />,
          }}
        />
        <Tabs.Screen
          name="kendaraan"
          options={{
            title: 'Kendaraan',
            tabBarButton: (props) => <AnimatedTabButton {...props} icon="car-sharp" label='Car' />,
          }}
        />
        
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarButton: (props) => <AnimatedTabButton {...props} icon="person-sharp" label="Profil" />,

          }}
        />
      </Tabs>
    </PrivateRoute>
  );
}
