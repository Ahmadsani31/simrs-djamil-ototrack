import { Redirect } from 'expo-router';
import { View, Text } from 'react-native';

import { useAuthStore } from '@/stores/authStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { token, isLoading } = useAuthStore();
  const insets = useSafeAreaInsets();
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

  return (
    <View className="flex-1" style={{ paddingTop: insets.top + 12 }}>
      {children}
    </View>
  );
};
