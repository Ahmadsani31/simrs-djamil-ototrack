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

export default function TabsLayout() {
  const trackingStatus = statusTrackingStore((state) => state.trackingStatus);
  const user = useAuthStore((state) => state.user);
  if (user?.role != 'driver') {
    return <Redirect href={'(protected)/(tabs-admin)'} />;
  }
  useEffect(() => {
    const requestLocationPermission = async () => {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      statusTrackingStore.getState().setTrackingStatus(hasStarted);
      console.log('Location background started:', hasStarted);
    };
    requestLocationPermission();
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const backAction = () => {
    if (router.canGoBack()) {
      // Kalau masih bisa mundur (ada history), cukup back saja
      router.back();
    } else {
      // Kalau tidak bisa mundur (sudah di root), tampilkan alert keluar
      Alert.alert('Konfirmasi Keluar', 'Apakah Anda yakin ingin keluar dari aplikasi home?', [
        {
          text: 'Batal',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'Keluar',
          onPress: () => BackHandler.exitApp(),
        },
      ]);
    }

    return true; // <- Wajib! Supaya sistem back tidak langsung nutup
  };

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
          headerRight: () => (
            <View
              className={`mx-4 p-1  ${trackingStatus ? 'bg-white' : 'bg-gray-500'} flex-row items-center rounded-lg`}>
              <MaterialIcons
                name={`${trackingStatus ? 'gps-fixed' : 'gps-off'}`}
                size={14}
                color={`${trackingStatus ? 'green' : 'black'}`}
              />
            </View>
          ),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Ionicons name="home-sharp" size={28} color={color} />,
            headerTitle: () => <Text className="text-xl font-bold text-white">Home</Text>,
          }}
        />

        <Tabs.Screen
          name="pemakaian"
          options={{
            title: 'Pemakaian',
            tabBarIcon: ({ color }) => (
              <Ionicons name="speedometer-sharp" size={28} color={color} />
            ),
            headerTitle: () => (
              <Text className="text-xl font-bold text-white">Pemakaian Kendaraan</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="pemiliharaan"
          options={{
            title: 'Pemiliharaan',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="car-cog" size={28} color={color} />
            ),
            headerTitle: () => (
              <Text className="text-xl font-bold text-white">Pemiliharaan Kendaraan</Text>
            ),
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
