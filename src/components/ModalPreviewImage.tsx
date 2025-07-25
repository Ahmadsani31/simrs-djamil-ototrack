import { View, Text, Modal, TouchableOpacity, Image } from 'react-native';
import { AntDesign, Entypo } from '@expo/vector-icons';

interface propsImage {
  visible: boolean;
  imgUrl: string;
  title: string;
  onPress: () => void;
}

export default function ModalPreviewImage({ visible, title, imgUrl, onPress }: propsImage) {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onPress}>
      <View className="flex-1  items-center justify-center bg-black/75">
        {imgUrl && (
          <View className="p-5">
            <View className="m-3 items-center">
              <Text className="w-80 rounded-md bg-white p-1 text-center font-bold">{title}</Text>
            </View>
            <View className="rounded-lg bg-white p-1">
              <Image
                className="aspect-[3/4] w-full  rounded-lg border border-white"
                source={{ uri: imgUrl }}
              />
            </View>
            <View className="mt-2 flex-row items-center justify-center">
              <TouchableOpacity
                className="flex-row items-center rounded-lg bg-white p-2"
                onPress={onPress}>
                <AntDesign name="closecircleo" size={24} color="red" />
                <Text className="ms-2 font-bold text-black">Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
