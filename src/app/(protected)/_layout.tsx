import LoadingIndikator from "@/components/LoadingIndikator";
import { PrivateRoute } from "@/components/PrivateRoute";
import { useLoadingStore } from "@/stores/loadingStore";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { Alert, BackHandler, Text } from "react-native";

// export const unstable_settings = {
//     initialRouteName: "(tabs)", // anchor
// };

export default function ProtectedLayout() {

    const loading = useLoadingStore((state) => state.loading);

    useEffect(() => {
        const backAction = () => {
            if (router.canGoBack()) {
                // Kalau masih bisa mundur (ada history), cukup back saja
                router.back();
            } else {
                // Kalau tidak bisa mundur (sudah di root), tampilkan alert keluar
                Alert.alert(
                    'Konfirmasi Keluar',
                    'Apakah Anda yakin ingin keluar dari aplikasi?',
                    [
                        {
                            text: 'Batal',
                            onPress: () => null,
                            style: 'cancel',
                        },
                        {
                            text: 'Keluar',
                            onPress: () => BackHandler.exitApp(),
                        },
                    ]
                );
            }

            return true; // <- Wajib! Supaya sistem back tidak langsung nutup
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, []);

    return (
        <PrivateRoute>
            {loading && <LoadingIndikator />}
            <Stack screenOptions={
                {
                    headerTitleAlign: 'center',
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
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="pengembalian"
                    options={{
                        headerShown: false,

                    }}
                />
                <Stack.Screen
                    name="pengembalianManual"
                    options={{
                        presentation: 'modal',
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