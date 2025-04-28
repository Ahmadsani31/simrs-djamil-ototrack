import { PrivateRoute } from "@/components/PrivateRoute";
import { Stack } from "expo-router";

export const unstable_settings = {
    initialRouteName: "(tabs)", // anchor
};

export default function ProtectedLayout() {

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