import { Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface InputProps {
    label?: string;
    placeholder: string;
    onChangeFile: (text: string) => void;
    error?: string;
}

export default function InputFile({
    label,
    onChangeFile,
    placeholder,
    error,
}: InputProps) {

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            // allowsEditing: true,
            // aspect: [3, 4],
            quality: 1,
        });

        // console.log(result);

        if (!result.canceled) {
            onChangeFile(result.assets[0].uri);
        }
    };

    return (
        <View className="mb-3">
            <Text className="text-gray-700 mb-1 font-bold">{label}</Text>
            <TouchableOpacity className={`flex-row gap-2 p-3 rounded-lg border items-center bg-slate-200`} onPress={pickImage} >
                <MaterialCommunityIcons name='file' size={20} />
                <Text className='font-bold'>{placeholder}</Text>
            </TouchableOpacity>
            {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
        </View>
    )
}
