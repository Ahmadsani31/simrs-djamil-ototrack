import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native';

import SkeletonList from '@/components/feedback/SkeletonList';

type propsUseQuery = {
  id: number;
  keterangan: string;
  file_image: string;
};

export default function PageServiceListImage({
  items,
  isLoading,
  onPress,
}: {
  items: propsUseQuery[];
  isLoading: boolean;
  onPress: (e: string) => void;
}) {
  const renderItem = ({ item }: { item: propsUseQuery }) => (
    <TouchableOpacity
      onPress={() => onPress(item.file_image)}
      className="flex-row items-center rounded-2xl bg-white p-3 shadow-sm"
      activeOpacity={0.8}>
      {item.file_image ? (
        <Image source={{ uri: item.file_image }} className="h-20 w-20 rounded-xl" />
      ) : (
        <View className="h-20 w-20 items-center justify-center rounded-xl bg-slate-100">
          <Feather name="image" size={24} color="#94a3b8" />
        </View>
      )}
      <View className="ml-3 flex-1">
        <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Keterangan
        </Text>
        <Text className="mt-0.5 text-sm text-gray-700" numberOfLines={3}>
          {item.keterangan}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (items.length === 0 && !isLoading) return null;

  return (
    <View className="rounded-2xl bg-white p-4 shadow-sm">
      <View className="mb-3 flex-row items-center gap-2">
        <View className="rounded-full bg-blue-50 p-1.5">
          <MaterialCommunityIcons name="image-multiple-outline" size={16} color="#3b82f6" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-gray-800">Laporan Pemeliharaan</Text>
          <Text className="text-[10px] text-gray-400">{items.length} laporan</Text>
        </View>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <View className="h-2" />}
        scrollEnabled={false}
        ListEmptyComponent={
          isLoading ? (
            <SkeletonList loop={3} />
          ) : (
            <View className="items-center py-6">
              <Feather name="file-minus" size={32} color="#cbd5e1" />
              <Text className="mt-2 text-xs text-gray-400">Belum ada laporan</Text>
            </View>
          )
        }
      />
    </View>
  );
}
