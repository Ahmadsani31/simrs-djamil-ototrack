import { View, Text, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { AntDesign } from '@expo/vector-icons';

import { PieChart } from 'react-native-gifted-charts';
import { API_URL } from '@/utils/constants';
// const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Profile() {
  const { user, logout } = useAuthStore();

  const pieData = [
    {
      value: 47,
      color: '#009FFF',
      gradientCenterColor: '#006DFF',
      focused: true,
    },
    { value: 40, color: '#93FCF8', gradientCenterColor: '#3BE9DE' },
    { value: 16, color: '#BDB2FA', gradientCenterColor: '#8F80F3' },
    { value: 3, color: '#FFA5BA', gradientCenterColor: '#FF7F97' },
  ];

  const renderDot = (color: string) => {
    return (
      <View
        style={{
          height: 10,
          width: 10,
          borderRadius: 5,
          backgroundColor: color,
          marginRight: 10,
        }}
      />
    );
  };

  const renderLegendComponent = () => {
    return (
      <>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 10,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: 120,
              marginRight: 20,
            }}>
            {renderDot('#006DFF')}
            <Text style={{ color: 'black' }}>Excellent: 47%</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', width: 120 }}>
            {renderDot('#8F80F3')}
            <Text style={{ color: 'black' }}>Okay: 16%</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: 120,
              marginRight: 20,
            }}>
            {renderDot('#3BE9DE')}
            <Text style={{ color: 'black' }}>Good: 40%</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', width: 120 }}>
            {renderDot('#FF7F97')}
            <Text style={{ color: 'black' }}>Poor: 3%</Text>
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 bg-slate-300">
        <View className="rounded-bl-[50] rounded-br-[50]  bg-[#205781] shadow">
          <View className="px-4">
            <View className="flex-row items-center justify-center gap-5 rounded-lg bg-white p-4">
              <View className="my-3">
                <Image
                  style={{
                    borderRadius: 100,
                    width: 80,
                    height: 80,
                  }}
                  source={require('@asset/images/profile.png')}
                />
              </View>
              <View className="my-2">
                <Text className="text-lg font-bold underline">{user?.name || 'Not available'}</Text>
                <Text className="text-lg">{user?.email || 'Not available'}</Text>
                <Text className="text-lg">Role : {user?.role || 'Not available'}</Text>
              </View>
            </View>

            <View className="mb-10">
              <TouchableOpacity
                onPress={logout}
                className={`my-3 w-full flex-row items-center justify-center rounded bg-red-400 p-3`}>
                <AntDesign name="logout" size={20} color="white" />
                <Text className="ms-3 font-bold text-white">Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View className="m-4 flex h-auto items-center justify-center rounded-lg bg-white p-4">
          <PieChart
            data={pieData}
            donut
            showGradient
            sectionAutoFocus
            radius={100}
            innerRadius={60}
            innerCircleColor={'#232B5D'}
            centerLabelComponent={() => {
              return (
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 22, color: 'white', fontWeight: 'bold' }}>47%</Text>
                  <Text style={{ fontSize: 14, color: 'white' }}>Excellent</Text>
                </View>
              );
            }}
          />
          {renderLegendComponent()}
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm">Pencatatan kendaraan operasional</Text>
          <Text className="text-lg font-bold">RSUP DR. M. DJAMIL PADANG</Text>
          <Text className="mt-4">Vesion</Text>
          <Text className="text-sm">{Constants.expoConfig?.version}</Text>
          {/* <Text className="text-xs">{API_URL}</Text> */}
        </View>
      </View>
    </SafeAreaView>
  );
}
