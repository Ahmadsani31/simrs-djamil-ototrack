import { View, ActivityIndicator } from 'react-native';

export default function LoadingIndikator() {
    return (
        <View className='absolute w-full h-full  bg-black/75 flex-1 items-center justify-center z-50'>
            <ActivityIndicator color="white" size={120} />
        </View>
    );
}