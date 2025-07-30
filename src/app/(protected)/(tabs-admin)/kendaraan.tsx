import { FlatList, Image, SafeAreaView, Text, View } from 'react-native';
import secureApi from '@/services/service';
import SkeletonList from '@/components/SkeletonList';
import { useQuery } from '@tanstack/react-query';
import { Kendaraan, KendaraanItemProps } from '@/types/types';

const fetchData = async () => {
  try {
    const response = await secureApi.get(`/kendaraan`);
    return response.data;
  } catch (error) {
    return [];
  }
};

export default function KendaraanScreen() {
  // const queryClient = useQueryClient()
  // useFocusEffect(
  //   useCallback(() => {
  //     refetch();
  //   }, [])
  // );

  const { data, isLoading, isError, error, refetch } = useQuery<Kendaraan[]>({
    queryKey: ['dataKendaraan'],
    queryFn: fetchData,
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 bg-slate-300">
        <View className="absolute h-44 w-full rounded-bl-[50] rounded-br-[50]  bg-[#205781]" />
        <View className="px-4">
          <View>
            <Text className="rounded-lg bg-[#F2E5BF] p-2 text-lg font-medium">
              Data kendaraan terdaftar
            </Text>
          </View>
          <FlatList
            data={data}
            bounces
            style={{ flexGrow: 0 }}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ paddingBottom: 120 }}
            renderItem={KendaraanItem}
            ListEmptyComponent={
              isLoading ? (
                <SkeletonList loop={10} />
              ) : (
                <View className="mt-5 flex-1 items-center justify-center rounded-lg bg-white p-5">
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
    <View className="my-2 rounded-lg bg-white px-4">
      <View className="w-full flex-row  items-center gap-2">
        <View>
          <Image source={require('@asset/images/car.png')} className="h-28 w-28" />
        </View>
        <View className="w-full">
          <Text className="text-xl font-bold">{item.model}</Text>
          <View className="w-72 border border-b-2" />
          <Text>Nomor Polisi : {item.no_polisi}</Text>
          <Text>Kondisi : {item.kondisi}</Text>
        </View>
      </View>
    </View>
  );
};
