import { View, Text, TouchableOpacity, Image as ImageLocal, Image } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import SkeletonList from './SkeletonList';

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
  const renderItem = ({ item }: { item: propsUseQuery }) => {
    return (
      <View className="flex-row items-center justify-between rounded-lg bg-white">
        <View className="w-full rounded-lg bg-gray-300">
          <TouchableOpacity onPress={() => onPress(item.file_image)} className="p-4">
            <View className="w-full flex-row gap-3">
              {item.file_image && (
                <Image source={{ uri: item.file_image }} className="size-28 rounded-lg" />
              )}
              <View className="flex-1 rounded-lg bg-white p-2">
                <Text className="text-sm">Keterangan :</Text>
                <Text className="text-wrap">{item.keterangan}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return items.length > 0 ? (
    <View className="rounded-lg bg-white p-4">
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 520, gap: 10 }}
        ListEmptyComponent={
          isLoading ? (
            <SkeletonList loop={8} />
          ) : (
            <View className="flex-1 items-center justify-center rounded-lg bg-white p-5">
              <Text>Tidak ada laporan pemiliharaan</Text>
            </View>
          )
        }
      />
    </View>
  ) : null;
}
