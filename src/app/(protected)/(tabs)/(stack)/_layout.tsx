import { PrivateRoute } from "@/components/PrivateRoute";
import { useAuthStore } from "@/stores/authStore";
import { Stack } from "expo-router";
import { Text } from "react-native";


export const unstable_settings = {
    // Ensure any route can link back to `/`
    initialRouteName: 'index',
};

export default function StackLayout() {
    return <Stack screenOptions={{
        headerShown:false
    }} />
}