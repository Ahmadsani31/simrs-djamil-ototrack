import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import dayjs from 'dayjs';
import { Image } from 'expo-image';
import { ListRenderItemInfo, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

type itemsProps = {
  id: number;
  file_image: string;
  keterangan: string;
  created_at: string;
};

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function ListDetailServiceSheet({ items }: { items: itemsProps[] }) {
  return (
    <View className="flex-1">
      <View className="border-b border-slate-100 px-4 pb-3 pt-1">
        <View className="flex-row items-center gap-2">
          <View className="rounded-full bg-blue-50 p-1.5">
            <MaterialCommunityIcons name="image-multiple-outline" size={16} color="#3b82f6" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-800">Detail Pemeliharaan</Text>
            <Text className="text-[11px] text-gray-400">{items.length} laporan</Text>
          </View>
        </View>
      </View>

      <BottomSheetFlatList<itemsProps>
        data={items}
        keyExtractor={(item: itemsProps) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 8, paddingHorizontal: 16 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          <View className="mt-8 items-center rounded-2xl bg-slate-50 p-8">
            <MaterialCommunityIcons name="wrench-outline" size={40} color="#cbd5e1" />
            <Text className="mt-3 text-center text-sm text-gray-400">
              Tidak ada laporan pemeliharaan
            </Text>
          </View>
        }
        renderItem={({ item }: ListRenderItemInfo<itemsProps>) => (
          <View className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <View className="flex-row items-center gap-1.5 border-b border-slate-100 px-3 py-2">
              <Feather name="calendar" size={11} color="#94a3b8" />
              <Text className="text-[11px] font-medium text-gray-500">
                {dayjs(item.created_at).format('ddd, DD MMM YYYY · HH:mm')}
              </Text>
            </View>
            <View className="flex-row gap-3 p-3">
              {item.file_image ? (
                <Image
                  source={{ uri: item.file_image }}
                  style={{ width: 100, height: 140, borderRadius: 12 }}
                  contentFit="cover"
                  placeholder={blurhash}
                  transition={500}
                />
              ) : (
                <View
                  style={{ width: 100, height: 140, borderRadius: 12 }}
                  className="items-center justify-center bg-slate-100">
                  <Feather name="image" size={32} color="#cbd5e1" />
                </View>
              )}
              <View className="flex-1">
                <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Keterangan
                </Text>
                <Text className="mt-1 text-sm text-gray-700">{item.keterangan}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}
