import { View, Text, TouchableOpacity, Image } from 'react-native'
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';

interface itemsProps {
    onPress: () => void;
}

export default function CustomHeader({ onPress }: itemsProps) {
    return (
        <View className=" mt-4 px-4">
            <View className='flex-row items-center justify-between '>
                <View className='p-1 bg-white rounded-lg'>
                    <Image style={{ width: 53, height: 30 }} source={require('@asset/images/logo/logo-home.png')} />
                </View>
                <TouchableOpacity onPress={onPress} className={`bg-white p-1 rounded-xl`}>
                    {/* <AntDesign name="closecircleo" size={24} color="red" /> */}
                    <MaterialCommunityIcons name="logout" size={24} color="red" />
                </TouchableOpacity>
            </View>
        

        </View>
    )
}