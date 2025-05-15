import { FlatList, Image, Text, View } from "react-native";
import secureApi from "@/services/service";
import SkeletonList from "@/components/SkeletonList";
import SafeAreaView from "@/components/SafeAreaView";
import { useQuery } from "@tanstack/react-query";
import { Kendaraan, KendaraanItemProps } from "@/types/types";

const fetchData = async () => {
  try {
    const response = await secureApi.get(`/kendaraan`);
    return response.data
  } catch (error) {
    return []
  }

};

export default function KendaraanScreen() {

  // const queryClient = useQueryClient()
  // useFocusEffect(
  //   useCallback(() => {
  //     // Refresh logic here
  //     // fetchData();
  //     queryClient.invalidateQueries({ queryKey: ['kendaraan'] })
  //   }, [])
  // );


  const { data, isLoading, isError, error } = useQuery<Kendaraan[]>({
    queryKey: ['dataKendaraan'],
    queryFn: fetchData,
  })

  return (
    <SafeAreaView noTop>
      <View className="flex-1 bg-slate-300">
        <View className='absolute w-full bg-[#205781] h-44 rounded-br-[50]  rounded-bl-[50]' />
        <View className="px-4">
          <View>
            <Text className="text-lg font-medium bg-[#F2E5BF] rounded-lg p-2">Data kendaraan terdaftar</Text>
          </View>
          <FlatList
            data={data}
            bounces
            style={{ flexGrow: 0 }}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ paddingBottom: 120 }}
            renderItem={KendaraanItem}
            ListEmptyComponent={
              isLoading ? <SkeletonList loop={10} /> : (
                <View className="flex-1 mt-5 justify-center items-center bg-white p-5 rounded-lg">
                  <Text>Tidak ada kendaraan Terdaftar</Text>
                </View>
              )
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}


const KendaraanItem = ({ item }: { item: KendaraanItemProps }) => {
  return (
    <View className="px-4 my-2 bg-white rounded-lg">
      <View className="gap-2 flex-row  w-full items-center">
        <View>
          <Image source={require('@asset/images/car.png')} className="w-28 h-28" />
        </View>
        <View className="w-full">
          <Text className="font-bold text-xl">{item.model}</Text>
          <View className="border border-b-2 w-72" />
          <Text>Nomor Polisi : {item.no_polisi}</Text>
          <Text>Kondisi : {item.kondisi}</Text>
        </View>
      </View>

    </View>

  );
};