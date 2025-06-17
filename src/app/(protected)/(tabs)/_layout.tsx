import { Tabs } from 'expo-router';
import { PrivateRoute } from '@/components/PrivateRoute';
import { Image, Text, View } from 'react-native';
import CustomNavBar from '@/components/CustomNavBar';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

import * as Location from 'expo-location';
import { statusTrackingStore } from '@/stores/statusTrackingStore';
import { useAuthStore } from '@/stores/authStore';

const LOCATION_TASK_NAME = 'background-location-task';

export default function TabsLayout() {

  const trackingStatus = statusTrackingStore((state) => state.trackingStatus);
  useEffect(() => {

    const requestLocationPermission = async () => {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      statusTrackingStore.getState().setTrackingStatus(hasStarted);
      console.log('Location background started:', hasStarted);
    }
    requestLocationPermission();
  }, []);


  return (
    <PrivateRoute>
      <Tabs
        tabBar={(props) => <CustomNavBar {...props} />}
        screenOptions={{
          headerTitleAlign: 'center',
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
            <View className='mx-4 p-1 bg-white rounded-lg flex-row items-center'>
              <Image style={{ width: 53, height: 30 }} source={require('@asset/images/logo/logo-home.png')} />
            </View>
          ),
          headerRight: () => (
            <View className={`mx-4 p-1  ${trackingStatus ? 'bg-white' : 'bg-gray-500'} rounded-lg flex-row items-center`}>
              <MaterialIcons name={`${trackingStatus ? 'gps-fixed' : 'gps-off'}`} size={14} color={`${trackingStatus ? 'green' : 'black'}`} />
            </View>
          ),
        }}
      >
        <Tabs.Screen
          name="(stack)"
          options={{
            title: "Home",
            headerTitle: () => (
              <Text className='font-bold text-white text-xl'>Home</Text>
            )
          }}
        />
        <Tabs.Screen
          name="pemakaian"
          options={{
            title: "Pemakaian",
            headerTitle: () => (
              <Text className='font-bold text-white text-xl'>Pemakaian Kendaraan</Text>
            )
          }}
        />
        <Tabs.Screen
          name="kendaraan"
          options={{
            title: "Kendaraan",
            headerTitle: () => (
              <Text className='font-bold text-white text-xl'>Kendaraan</Text>
            )
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerTitle: () => (
              <Text className='font-bold text-white text-xl'>Profile Information</Text>
            )
          }}
        />
      </Tabs>
    </PrivateRoute>
  );
}
