import LoadingIndikator from "@/components/LoadingIndikator";
import { PrivateRoute } from "@/components/PrivateRoute";
import { useLoadingStore } from "@/stores/loadingStore";
import { router, Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { Alert, BackHandler, Image, Pressable, TouchableHighlight, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { colors } from "@/constants/colors";
import SafeAreaView from "@/components/SafeAreaView";
import * as SecureStore from 'expo-secure-store';

export const unstable_settings = {
    initialRouteName: "index", // anchor
};

export default function PerjalananLayout() {

    return (
        <SafeAreaView noTop>
            <Stack screenOptions={
                {
                    headerTitleAlign: 'center',
                    headerStyle: {
                        backgroundColor: '#205781',
                    },
                }
            }>
                <Stack.Screen
                    name="index"
                    options={{
                        headerShown: false,
                    }}
                />
            </Stack>
        </SafeAreaView>
    );
}