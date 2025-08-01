import { View, Text, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { AntDesign, Entypo } from '@expo/vector-icons';
import { Image } from 'expo-image';

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
  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onPress}>
      <View className="flex-1  items-center justify-end bg-black/75">
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
              <Image
                style={{ height: height / 2, borderRadius: 10 }}
                source={{ uri: imgUrl }}
                placeholder={blurhash}
                contentFit="fill"
                transition={1000}
              />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
