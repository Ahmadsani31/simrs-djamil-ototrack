import { View, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/constants/colors';
import { Image } from 'expo-image';
import SafeAreaView from '@/components/SafeAreaView';
import { AntDesign } from '@expo/vector-icons';

export default function Profile() {
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView noTop>
      <View className="flex-1 bg-slate-300">
        <View className="bg-[#205781] rounded-br-[50]  rounded-bl-[50] shadow">
          {/* <View className='items-center mb-3'>
          <View className='items-center bg-white p-2 rounded-full w-52 h-52 justify-center'>
            <Image style={{
              borderRadius: 100,
              width: 150,
              height: 150,
            }} source={{
              uri: 'https://placehold.co/400x400'
            }} />
          </View>
        </View> */}
          <View className='px-4'>

            <View className='bg-white items-center rounded-lg p-4'>
              <View className='my-3'>
              <Image style={{
                borderRadius: 100,
                width: 150,
                height: 150,
              }} source={{
                uri: 'https://placehold.co/400x400'
              }} />
              </View>

              <Text className="text-xl font-bold mb-4">Profile Information</Text>

              <View className='my-2'>
                <Text className="text-lg">{user?.name || 'Not available'}</Text>
              </View>

              <View className='my-2'>
                <Text className="text-lg">{user?.email || 'Not available'}</Text>
              </View>

            </View>
            <View className='mt-5 mb-10'>
              <TouchableOpacity
                onPress={logout}
                className={`${colors.danger} p-3 flex-row justify-center rounded items-center w-full`}
              >
                <AntDesign name="logout" size={20} color="white" />
                <Text className="text-white ms-3 font-medium">Logout</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
}