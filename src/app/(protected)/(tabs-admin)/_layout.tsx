import { Redirect, router, Tabs } from 'expo-router';
import { PrivateRoute } from '@/components/PrivateRoute';
import { Alert, BackHandler, Image, Text, View } from 'react-native';
import CustomNavBar from '@/components/CustomNavBar';
import { FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

import * as Location from 'expo-location';
import { statusTrackingStore } from '@/stores/statusTrackingStore';
import { useAuthStore } from '@/stores/authStore';

const LOCATION_TASK_NAME = 'background-location-task';

export default function TabsAdminLayout() {
  const user = useAuthStore((state) => state.user);
  if (user?.role != 'admin') {
    return <Redirect href={'(protected)/(tabs)'} />;
  }
  return (
    <PrivateRoute>
      <Tabs
        // tabBar={(props:any) => <CustomNavBar {...props} />}
        screenOptions={{
          animation: 'fade',
          headerTitleAlign: 'center',
          tabBarActiveTintColor: 'white',
          tabBarStyle: {
            backgroundColor: '#205781', // Set your desired background color here
            // paddingBottom: 10,  // ⬇️ Padding bawah TabBar
            paddingTop: 10, // ⬆️ Padding atas TabBar
            height: 70, // ⬆️ Tinggi TabBar jika padding terlalu besar
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
          headerLeft: () => (
            <View className="mx-4 flex-row items-center rounded-lg bg-white p-1">
              <Image
                style={{ width: 53, height: 30 }}
                source={require('@asset/images/logo/logo-home.png')}
              />
            </View>
          ),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <Ionicons name="speedometer-sharp" size={28} color={color} />
            ),
            headerTitle: () => <Text className="text-xl font-bold text-white">Home</Text>,
          }}
        />
        <Tabs.Screen
          name="kendaraan"
          options={{
            title: 'Kendaraan',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="car-side" size={28} color={color} />
            ),
            headerTitle: () => <Text className="text-xl font-bold text-white">Kendaraan</Text>,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <Ionicons name="person-sharp" size={28} color={color} />,
            headerTitle: () => (
              <Text className="text-xl font-bold text-white">Profile Information</Text>
            ),
          }}
        />
      </Tabs>
    </PrivateRoute>
  );
}
