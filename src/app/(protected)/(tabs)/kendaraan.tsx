import { Button, Dimensions, FlatList, Image, Text, View } from "react-native";
import { useCallback, useEffect, useState } from "react";
import secureApi from "@/services/service";
import SkeletonList from "@/components/SkeletonList";
import SafeAreaView from "@/components/SafeAreaView";
import { useFocusEffect } from "expo-router";
import { useLoadingStore } from "@/stores/loadingStore";

interface KendaraanItemProps {
  model: string;
  no_polisi: string;
  kondisi: string;
}

interface Kendaraan {
  id: number;
  model: string;
  no_polisi: string;
  kondisi: string;
}

export default function KendaraanScreen() {
  const setLoading = useLoadingStore((state) => state.setLoading);

  const [dataKendaraan, setDatakendaraan] = useState<Kendaraan[]>([])
  useFocusEffect(
    useCallback(() => {
      // Refresh logic here
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await secureApi.get(`/kendaraan`);

      // console.log(res.data.data);

      setDatakendaraan(res.data.data)

    } catch (error: any) {
      console.log("Error fetching data:", JSON.stringify(error.response?.data?.message));
      // console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView noTop>
      <View className="flex-1 bg-slate-300">
        <View className='absolute w-full bg-[#205781] h-44 rounded-br-[50]  rounded-bl-[50]' />
        <View className="px-4">

          <FlatList
            data={dataKendaraan}
            bounces
            style={{ flexGrow: 0 }}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 80 }}
            stickyHeaderIndices={[0]}
            ListHeaderComponent={
              <View>
                <Text className="text-xl font-bold bg-[#F2E5BF] rounded-lg p-2">Data kendaraan terdaftar</Text>
              </View>
            }
            renderItem={KendaraanItem}
            ListEmptyComponent={
              <View className="flex-1 mt-5 justify-center items-center bg-white p-5 rounded-lg">
                <Text>Belum ada pemakaian kendaraan</Text>
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}


const KendaraanItem = ({ item }: { item: KendaraanItemProps }) => {
  return (
    <View className="p-4 my-2 bg-white rounded-lg">
      <View className="flex-1 flex-row w-full items-center">
        <View>
          <Image source={require('@asset/images/car.png')} className="w-28 h-28" />
        </View>
        <View className="ms-2 w-full">
          <Text className="font-bold text-xl">{item.model}</Text>
          <View className="border border-b-2 w-72" />
          <Text>Nomor Polisi : {item.no_polisi}</Text>
          <Text>Kondisi : {item.kondisi}</Text>
        </View>
      </View>

    </View>

  );
};