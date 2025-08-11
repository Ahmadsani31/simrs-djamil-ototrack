import { Redirect, router, Tabs } from 'expo-router';
import { PrivateRoute } from '@/components/PrivateRoute';
import { Image, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsAdminLayout() {
  const user = useAuthStore((state) => state.user);
  const insets = useSafeAreaInsets();
  if (user?.role != 'admin') {
    return <Redirect href={'(protected)/(tabs)'} />;
  }
  return (
    <PrivateRoute>
      <Tabs
        // tabBar={(props:any) => <CustomNavBar {...props} />}
        screenOptions={{
          animation: 'fade',
          headerTitleAlign: 'center',
          tabBarActiveTintColor: 'white',
          tabBarStyle: {
            backgroundColor: '#205781', // Set your desired background color here
            // paddingBottom: 10,  // ⬇️ Padding bawah TabBar
            paddingTop: 10, // ⬆️ Padding atas TabBar
            height: 70 + insets.bottom, // naik sesuai safe area
            paddingBottom: insets.bottom,
          },
          headerStyle: {
            backgroundColor: '#205781',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#fff',
          },
          headerLeft: () => (
            <View className="mx-4 flex-row items-center rounded-lg bg-white p-1">
              <Image
                style={{ width: 53, height: 30 }}
                source={require('@asset/images/logo/logo-home.png')}
              />
            </View>
          ),
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <Ionicons name="speedometer-sharp" size={28} color={color} />
            ),
            headerTitle: () => <Text className="text-xl font-bold text-white">Daily Use</Text>,
          }}
        />
        <Tabs.Screen
          name="pemiliharaan"
          options={{
            title: 'Pemeliharaan',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="car-cog" size={28} color={color} />
            ),
            headerTitle: () => <Text className="text-xl font-bold text-white">Maintenance</Text>,
          }}
        />
        <Tabs.Screen
          name="kendaraan"
          options={{
            title: 'Kendaraan',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="car-side" size={28} color={color} />
            ),
            headerTitle: () => <Text className="text-xl font-bold text-white">Kendaraan</Text>,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <Ionicons name="person-sharp" size={28} color={color} />,
            headerTitle: () => (
              <Text className="text-xl font-bold text-white">Profile Information</Text>
            ),
          }}
        />
      </Tabs>
    </PrivateRoute>
  );
}
