import { PrivateRoute } from "@/components/PrivateRoute";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { Alert, BackHandler } from "react-native";

export const unstable_settings = {
    initialRouteName: "(tabs)", // anchor
};

export default function ProtectedLayout() {

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
                            text: 'Tidak',
                            onPress: () => null,
                            style: 'cancel',
                        },
                        {
                            text: 'Ya',
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
    }, [router]);

    return (
        <PrivateRoute>
            <Stack>
                <Stack.Screen
                    name="(tabs)"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="detail"
                    options={{
                    }}
                />

            </Stack>
        </PrivateRoute>
    );
}