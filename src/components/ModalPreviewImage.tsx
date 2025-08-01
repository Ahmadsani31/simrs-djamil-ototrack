import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { AntDesign, Entypo } from '@expo/vector-icons';
import { Image } from 'expo-image';

interface propsImage {
  visible: boolean;
  imgUrl: string;
  title: string;
  onPress: () => void;
}

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

export default function ModalPreviewImage({ visible, title, imgUrl, onPress }: propsImage) {
  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onPress}>
      <View className="flex-1  items-center justify-end bg-black/75">
        {imgUrl && (
          <View className="rounded-t-xl bg-white" style={{ paddingBottom: 0 }}>
            <TouchableOpacity
              className="h-10 flex-row items-center justify-center rounded-t-xl bg-gray-200"
              onPress={onPress}>
              <AntDesign name="downcircle" size={18} color="black" />
              <Text className="ms-2 font-bold text-black">Tutup</Text>
            </TouchableOpacity>
            {/* <Text className="mt-2 rounded-md text-center text-xl font-bold">{title}</Text> */}
            <View className="p-2">
              <View className="rounded-lg bg-white p-1">
                <Image
                  className="aspect-[3/4] w-full  rounded-lg border border-white"
                  style={{ width: 'auto' }}
                  source={{ uri: imgUrl }}
                  placeholder={blurhash}
                  contentFit="contain"
                  transition={1000}
                />
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
