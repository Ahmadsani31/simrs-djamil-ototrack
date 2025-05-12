import { View, Text, TouchableOpacity } from 'react-native'
import { AntDesign } from '@expo/vector-icons';

export default function ButtonCloseImage({onPress}:{onPress:()=>void}) {
    return (
        <TouchableOpacity className="absolute bg-white rounded-full p-1 right-1 top-1" onPress={onPress}>
            <AntDesign name="closecircleo" size={24} color="red" />
        </TouchableOpacity>
    )
}