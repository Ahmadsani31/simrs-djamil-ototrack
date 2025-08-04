import { BottomSheetFlatList, BottomSheetSectionList } from '@gorhom/bottom-sheet';
import dayjs from 'dayjs';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';

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
    <View>
      <BottomSheetFlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center rounded-lg bg-white p-5">
            <Text>Tidak ada pemiliharaan kendaraan yang di lakukan</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View className="w-full flex-1 px-4 " key={index}>
            <Text className="text-sm text-gray-500">
              {dayjs(item.created_at).format('dddd, DD MMMM YYYY | HH:mm')}
            </Text>
            <View className="mb-3 rounded-lg bg-slate-200 p-2">
              <View className="w-full flex-1 flex-row items-start gap-5">
                {item.file_image && (
                  <Image
                    source={{ uri: item.file_image }}
                    style={{ flex: 1, aspectRatio: 3 / 4, borderRadius: 8 }}
                    contentFit="contain"
                    placeholder={blurhash}
                    transition={500}
                  />
                )}
                <View className="flex-1">
                  <Text className="text-wrap">{item.keterangan}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}
