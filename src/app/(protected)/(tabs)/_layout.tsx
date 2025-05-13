import { Tabs } from 'expo-router';
import { PrivateRoute } from '@/components/PrivateRoute';
import {Image, Text, View } from 'react-native';
import CustomNavBar from '@/components/CustomNavBar';

export default function TabsLayout() {

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
