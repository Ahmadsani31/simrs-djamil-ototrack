import { Redirect } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import { View, Text } from 'react-native';
import SafeAreaView from './SafeAreaView';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { token, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }
  
  if (!token) {
    return <Redirect href="/login" />;
  }
  
  return <SafeAreaView className='flex-1' noBottom={true} noTop={true} >{children}</SafeAreaView>;
};