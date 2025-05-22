import { View, Text, TouchableOpacity, Image } from 'react-native'
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';

interface itemsProps {
    onPress: () => void;
    title: string
}

export default function CustomHeader({ onPress, title }: itemsProps) {
    return (
        <View className="flex-row items-center justify-around mt-4">
            <View className='p-1 bg-white rounded-lg'>
                <Image style={{ width: 53, height: 30 }} source={require('@asset/images/logo/logo-home.png')} />
            </View>
            <Text className="text-2xl font-bold text-white">{title}</Text>
            <TouchableOpacity onPress={onPress} className={`bg-white p-1 rounded-xl`}>
                {/* <AntDesign name="closecircleo" size={24} color="red" /> */}
                <MaterialCommunityIcons name="logout" size={24} color="red" />
            </TouchableOpacity>
        </View>
    )
}