import { TextInput, Text, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
interface ErrorProps {
    plaintext: string
}

export default function ViewError({ plaintext }: ErrorProps) {

    return (
        <View className='bg-red-300 p-4 my-4 rounded-lg flex-row items-center'>
            <AntDesign name="exclamationcircle" size={24} color="black" />
            <View className='ms-2'>
                <Text className='font-medium'>{plaintext}</Text>
            </View>
        </View>
    )

}