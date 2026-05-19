import { Image } from 'expo-image';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function Loader() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      {/* <ActivityIndicator size="large" color="#3B82F6" /> */}
      <Image source={require('assets/images/gif/loader.gif')} style={{width:250 ,height:250}} transition={1000}/>
    </View>
  );
}