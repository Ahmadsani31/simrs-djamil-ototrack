import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import { useAuthStore } from '@/stores/authStore';

export default function TabsAdminLayout() {
  const user = useAuthStore((state) => state.user);
  const insets = useSafeAreaInsets();
  if (user?.role != 'admin') {
    return <Redirect href="(protected)/(tabs)" />;
  }
  return (
    <Tabs
      screenOptions={{
        animation: 'fade',
        headerShown: false,
        tabBarActiveTintColor: 'white',
        tabBarStyle: {
          backgroundColor: colors.brand,
          paddingTop: 10,
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="speedometer-sharp" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pemiliharaan"
        options={{
          title: 'Pemeliharaan',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="car-cog" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="kendaraan"
        options={{
          title: 'Kendaraan',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="car-side" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerStyle: { backgroundColor: '#000000' },
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person-sharp" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
