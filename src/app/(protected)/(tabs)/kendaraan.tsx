import { Button, Dimensions, FlatList, Image, Text, View } from "react-native";
import { useEffect, useState } from "react";
import secureApi from "@/services/service";
import SkeletonList from "@/components/SkeletonList";

const { height } = Dimensions.get('window');

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
  const [loading, setLoading] = useState(false);

  const [dataKendaraan, setDatakendaraan] = useState<Kendaraan[]>([])

  useEffect(() => {

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

    fetchData();

  }, []);

  return (
    <View className="flex-1 bg-slate-300">
      <View className='absolute w-full bg-[#205781] h-44 rounded-br-[50]  rounded-bl-[50]' />
      <View className="px-4">
        <Text className="text-xl mb-2 font-bold text-white">List Kendaraan</Text>
        {loading ? <SkeletonList loop={5} /> : (
          <FlatList
            data={dataKendaraan}
            bounces
            style={{ flexGrow: 0 }}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 105 }}
            renderItem={({ item }) => <KendaraanItem model={item.model} no_polisi={item.no_polisi} kondisi={item.kondisi} />}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center bg-white p-5 rounded-lg">
                <Text>Belum ada pemakaian kendaraan</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const KendaraanItem = ({ model, no_polisi, kondisi }: KendaraanItemProps) => {
  return (
    <View className="p-4 my-2 bg-white rounded-lg">
      <View className="flex-1 flex-row w-full items-center">
        <View>
          <Image source={require('@asset/images/car.png')} className="w-28 h-28" />
        </View>
        <View className="ms-2 w-full">
          <Text className="font-bold text-xl">{model}</Text>
          <View className="border border-b-2 w-72" />
          <Text>Nomor Polisi : {no_polisi}</Text>
          <Text>Kondisi : {kondisi}</Text>
        </View>
      </View>

    </View>

  );
};