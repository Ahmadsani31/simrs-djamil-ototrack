import { Button, Text, View } from "react-native";
import { useRouter } from "expo-router";

export default function KendaraanScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-slate-300">
      <View className='absolute w-full bg-[#60B5FF] h-44 rounded-br-[50]  rounded-bl-[50]' />
      <Text className="text-8xl font-bold">Screen Kendaraan</Text>
      <Button
        title="Back"
        onPress={() => {
          router.back();
        }}
      />
    </View>
  );
}