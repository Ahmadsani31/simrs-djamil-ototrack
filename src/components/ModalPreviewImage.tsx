import { View, Text, Modal, TouchableOpacity, Image } from 'react-native'
import { AntDesign, Entypo } from '@expo/vector-icons';

interface propsImage {
    visible: boolean;
    imgUrl: string;
    title: string
    onPress: () => void
}

export default function ModalPreviewImage({ visible, title, imgUrl, onPress }: propsImage) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onPress}>
            <View className='flex-1  justify-center items-center bg-black/75'>
                {imgUrl && (
                    <View className='p-5'>
                        <TouchableOpacity className="absolute z-10 bg-white rounded-full p-1 right-12 top-2" onPress={onPress}>
                            <AntDesign name="closecircleo" size={32} color="red" />
                        </TouchableOpacity>
                        <View className='m-3 items-center'>
                            <Text className='font-bold w-80 bg-white text-center p-1 rounded-md'>{title}</Text>
                        </View>
                        <View className='bg-white rounded-lg p-1'>
                            <Image className='aspect-[3/4] w-full  border border-white rounded-lg' source={{ uri: imgUrl }} />
                        </View>
                    </View>
                )}

            </View>
        </Modal>
    )
}