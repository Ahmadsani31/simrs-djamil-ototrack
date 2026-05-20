import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { View, Text } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { token, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/login" />;
  }

  return <SafeAreaView style={{ flex: 1, paddingTop: 0 }}>{children}</SafeAreaView>;
};
