import { Linking, Platform, Text, View } from 'react-native'
import { Image } from 'expo-image'

export default function RequiredPermission() {

    const openAppSettings = () => {
        if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
        } else {
            Linking.openSettings(); // Android
        }
    };

    return (
        <View className='flex-1 items-center justify-center bg-white'>
            <Image source={require('assets/images/gif/permission.gif')} style={{ width: 250, height: 250 }} transition={1000} />
            <Text>Memeriksa izin...</Text>
        </View>
    )
}