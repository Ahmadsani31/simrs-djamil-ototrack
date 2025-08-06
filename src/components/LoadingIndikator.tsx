import { View, ActivityIndicator } from 'react-native';

export default function LoadingIndikator() {
  return (
    <View className="absolute z-50 h-full  w-full flex-1 items-center justify-center bg-black/50">
      <ActivityIndicator color="white" size={120} />
    </View>
  );
}
