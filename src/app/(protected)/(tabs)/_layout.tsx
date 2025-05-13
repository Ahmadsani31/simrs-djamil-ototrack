import { Tabs } from 'expo-router';
import { PrivateRoute } from '@/components/PrivateRoute';
import { useEffect, useState } from 'react';
import { Alert, Image, Platform, Text, View } from 'react-native';
import { AnimatedTabButton } from '@/components/AnimatedTabButton';

import { Camera } from 'expo-camera';
import * as Location from 'expo-location'

import Loader from '@/components/Loader';
import CustomNavBar from '@/components/CustomNavBar';

export default function TabsLayout() {

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Request location permission
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        if (locationStatus !== 'granted') {
          Alert.alert('Izin diperlukan', 'Aplikasi memerlukan akses lokasi untuk digunakan.');
          return;
        }

        // if (Platform.OS === 'android') {
        //   const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        //   if (backgroundStatus !== 'granted') {
        //     Alert.alert('Izin lokasi latar belakang diperlukan', 'Aktifkan izin di pengaturan untuk pelacakan penuh.');
        //   }
        // }

        // Request camera permission
        const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
          Alert.alert('Izin diperlukan', 'Aplikasi memerlukan akses kamera untuk digunakan.');
          return;
        }

        // Jika semua izin disetujui
        setIsReady(true);
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    })();

  }, []);

  if (!isReady) {
    return <Loader />;
  }


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
            <View className='px-5 flex-row items-center'>
              <Image style={{ width: 40, height: 40 }} source={require('@asset/images/logo/logo-M-Djamil.png')} />
            </View>
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title:"Home",
            headerTitle: () => (
              <Text className='font-bold text-white text-xl'>Home</Text>
            )
          }}
        />
        <Tabs.Screen
          name="pemakaian"
          options={{
            title:"Pemakaian",
            headerTitle: () => (
              <Text className='font-bold text-white text-xl'>Pemakaian Kendaraan</Text>
            )
          }}
        />
        <Tabs.Screen
          name="kendaraan"
          options={{
            title:"Kendaraan",
            headerTitle: () => (
              <Text className='font-bold text-white text-xl'>Kendaraan</Text>
            )
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
             title:"Profile",
            headerTitle: () => (
              <Text className='font-bold text-white text-xl'>Profil</Text>
            )
          }}
        />
      </Tabs>
    </PrivateRoute>
  );
}
