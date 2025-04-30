import { Button, Dimensions, FlatList, Image, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { dataKendaraan } from "@/data/Example";

const { height } = Dimensions.get('window');

export default function KendaraanScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-slate-300">
      <View className='absolute w-full bg-[#60B5FF] h-44 rounded-br-[50]  rounded-bl-[50]' />
      <View className="p-4">
        <Text className="text-xl mb-2 font-bold text-white">List Kendaraan</Text>
        <FlatList
          data={dataKendaraan}
          bounces
          style={{height:height-190,flexGrow:0}}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="p-4 my-2 bg-white rounded-lg">
              <View className="flex-1 flex-row w-full items-center">
                <View>
                  {item.jenis == 'Motor' ? (
                    <Image source={require('@asset/images/motor.png')} className="w-28 h-28" />
                  ) : (
                    <Image source={require('@asset/images/car.png')} className="w-28 h-28" />
                  )}
                </View>
                <View className="ms-2 w-full">
                  <Text className="font-bold text-xl">{item.nama}</Text>
                  <View className="border border-b-2 w-72"/>
                  <Text>Model: {item.model}</Text>
                  <Text>Jenis: {item.jenis}</Text>
                  <Text>Nomor Polisi: {item.nomorPolisi}</Text>
                </View>
              </View>

            </View>
          )}
        />
        <View className='h-96' />
      </View>

    </View>
  );
}