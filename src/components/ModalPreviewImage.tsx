import { View, Text, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { AntDesign, Entypo } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';

interface propsImage {
  visible: boolean;
  imgUrl: string;
  title: string;
  onPress: () => void;
}

const { width, height } = Dimensions.get('window');

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function ModalPreviewImage({ visible, title, imgUrl, onPress }: propsImage) {
  const [loading, setLoading] = useState(true);
  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onPress}>
      <View className="flex-1  items-center justify-end bg-black/25">
        {imgUrl && (
          <View className="rounded-t-2xl bg-white">
            <TouchableOpacity
              className="h-14 flex-row items-center justify-center rounded-t-2xl bg-gray-200"
              onPress={onPress}>
              <AntDesign name="downcircle" size={18} color="black" />
              <Text className="ms-2 font-bold text-black">Tutup</Text>
            </TouchableOpacity>
            {/* <Text className="mt-2 rounded-md text-center text-xl font-bold">{title}</Text> */}
            <View style={{ width: width, padding: 15 }}>
              {loading && (
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: 'timing', duration: 300 }}
                  className="flex-row items-center justify-center space-x-4 p-4">
                  <View className="flex-row items-center justify-between gap-5">
                    <Skeleton colorMode="light" height={40} width={150} radius={10} />
                    <Text className="font-bold">Loading</Text>
                    <Skeleton colorMode="light" height={40} width={150} radius={10} />
                  </View>
                </MotiView>
              )}
              <Image
                style={{ aspectRatio: 3 / 4, borderRadius: 10 }}
                source={{ uri: imgUrl }}
                contentFit="contain"
                placeholder={blurhash}
                transition={500}
                onLoadEnd={() => setLoading(false)}
              />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
