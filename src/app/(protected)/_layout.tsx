import LoadingIndikator from "@/components/LoadingIndikator";
import { PrivateRoute } from "@/components/PrivateRoute";
import { useLoadingStore } from "@/stores/loadingStore";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { Alert, BackHandler, Image, Text, Touchable, TouchableOpacity, View } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
// export const unstable_settings = {
//     initialRouteName: "(tabs)", // anchor
// };

export default function ProtectedLayout() {

    const loading = useLoadingStore((state: any) => state.loading);

    const backAction = () => {
        Alert.alert('Peringatan!', 'Apakah Kamu yakin ingin membatalkan proses saat ini??', [
            {
                text: 'Cancel',
                onPress: () => null,
                style: 'cancel',
            },
            { text: 'YES', onPress: () => router.back() },
        ]);
        return true;
    };

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => backHandler.remove();
    }, [router]);

    return (
        <PrivateRoute>
            {loading && <LoadingIndikator />}
            <Stack screenOptions={
                {
                    headerTitleAlign: 'center',
                    headerShown: false,
                    headerStyle: {
                        backgroundColor: '#205781',
                    },
                }
            }>
                <Stack.Screen
                    name="(tabs)"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="detail"
                    options={{
                        headerShown: true,
                        headerTitle: '',
                        headerRight: () => (
                            <TouchableOpacity className="bg-white rounded-full p-1" onPress={() => backAction()}>
                                <Ionicons name="arrow-back-circle" size={24} color="red" />
                            </TouchableOpacity>
                        ),
                        headerLeft: () => (
                            <View className='p-1 bg-white w-44 flex-row items-center rounded-lg gap-1'>
                                <Image style={{ width: 53, height: 30 }} source={require('@asset/images/logo/logo-kemenkes.png')} />
                                <Text className="font-bold">Oto RS-Djamil</Text>
                            </View>
                        )
                    }}
                />
                <Stack.Screen
                    name="service"
                    options={{
                        headerShown: true,
                        headerTitle: '',
                        headerRight: () => (
                            <TouchableOpacity className="bg-white rounded-full p-1" onPress={() => backAction()}>
                                <Ionicons name="arrow-back-circle" size={24} color="red" />
                            </TouchableOpacity>
                        ),
                        headerLeft: () => (
                            <View className='p-1 bg-white w-44 flex-row items-center rounded-lg gap-1'>
                                <Image style={{ width: 53, height: 30 }} source={require('@asset/images/logo/logo-kemenkes.png')} />
                                <Text className="font-bold">Oto RS-Djamil</Text>
                            </View>
                        )
                    }}
                />
                <Stack.Screen
                    name="pengembalian"
                    options={{
                        headerShown: true,
                        headerTitle: '',
                        headerRight: () => (
                            <TouchableOpacity className="bg-white rounded-full p-1" onPress={() => backAction()}>
                                <Ionicons name="arrow-back-circle" size={24} color="red" />
                            </TouchableOpacity>
                        ),
                        headerLeft: () => (
                            <View className='p-1 bg-white w-44 flex-row items-center rounded-lg gap-1'>
                                <Image style={{ width: 53, height: 30 }} source={require('@asset/images/logo/logo-kemenkes.png')} />
                                <Text className="font-bold">Oto RS-Djamil</Text>
                            </View>
                        )
                    }}
                />
                <Stack.Screen
                    name="pengembalianManual"
                    options={{
                        // presentation: 'modal',
                        headerShown: false,
                        title: "Pengembalian Manual",
                        headerTitle: () => (
                            <Text className='font-bold text-white text-xl'>Pengembalian Manual</Text>
                        )
                    }}
                />
            </Stack>
        </PrivateRoute>
    );
}