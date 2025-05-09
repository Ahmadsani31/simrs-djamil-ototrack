import LoadingIndikator from "@/components/LoadingIndikator";
import { PrivateRoute } from "@/components/PrivateRoute";
import { useLoadingStore } from "@/stores/loadingStore";
import { router, Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { Alert, BackHandler, Image, Pressable, TouchableHighlight, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { colors } from "@/constants/colors";

export const unstable_settings = {
    initialRouteName: "(tabs)", // anchor
};

export default function ProtectedLayout() {

    const loading = useLoadingStore((state) => state.loading);
    const route = useRouter();

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

    const backAction = () => {
        console.log('bal=ck');

        Alert.alert('Peringatan!', 'Apakah Kamu yakin ingin membatalkan proses pemakaian kendaraan?', [
            {
                text: 'Cancel',
                onPress: () => null,
                style: 'cancel',
            },
            { text: 'YES', onPress: () => router.back() },
        ]);
        return true;
    };

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
                        title: 'Proses Pemakaian Kendaraan',
                        headerTintColor: '#fff',
                        headerTitleStyle: {
                            fontWeight: 'bold',
                        },
                        headerLeft: () => (
                            <Image style={{ width: 40, height: 40 }} source={require('@asset/images/logo/logo-M-Djamil.png')} />
                        ),
                    }}
                />
                <Stack.Screen
                    name="pegembalian"
                    options={{
                        title: 'Proses Pegembalian Kendaraan',
                        headerTintColor: '#fff',
                        headerTitleStyle: {
                            fontWeight: 'bold',
                        },
                        headerShown: true,
                        headerLeft: () => (
                            <TouchableHighlight onPress={() => Alert.alert('gagal')} className={`${colors.primary} p-1 rounded-full`}>
                                <Ionicons name="arrow-back" size={24} color={'white'} />
                            </TouchableHighlight>
                        ),
                    }}
                />
            </Stack>
        </PrivateRoute>
    );
}