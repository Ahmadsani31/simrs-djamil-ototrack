import { View, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/constants/colors';

export default function Profile() {
  const { user, logout } = useAuthStore();
console.log('====================================');
console.log(user);
console.log('====================================');
  return (
    <View className="flex-1 bg-slate-300">
      <View className="bg-[#205781] rounded-br-[50]  rounded-bl-[50] p-6  shadow">
        <View className='bg-white rounded-lg p-4'>
        <Text className="text-xl font-bold mb-4">Profile Information</Text>
        
        <View className="mb-4">
          <Text className="text-gray-500">Name</Text>
          <Text className="text-lg">{user?.name || 'Not available'}</Text>
        </View>
        
        <View className="mb-6">
          <Text className="text-gray-500">Email</Text>
          <Text className="text-lg">{user?.email || 'Not available'}</Text>
        </View>
        
        <TouchableOpacity
          onPress={logout}
          className={`${colors.danger} p-3 rounded items-center`}
        >
          <Text className="text-white font-medium">Logout</Text>
        </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}