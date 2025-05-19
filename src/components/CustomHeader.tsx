import { View, Text, TouchableOpacity, Image } from 'react-native'
import { AntDesign } from '@expo/vector-icons';

interface itemsProps {
    onPress: () => void;
    title: string
}

export default function CustomHeader({ onPress, title }: itemsProps) {
    return (
        <View className="flex-row items-center justify-around px-4 mt-4">
            <Image style={{ width: 40, height: 40 }} source={require('@asset/images/logo/logo-M-Djamil.png')} />
            <View className="w-64">
                <Text className="text-2xl font-bold text-white text-center">{title}</Text>
            </View>
            <TouchableOpacity onPress={onPress} className={`bg-white p-1 rounded-full`}>
                <AntDesign name="closecircleo" size={24} color="red" />
            </TouchableOpacity>
        </View>
    )
}