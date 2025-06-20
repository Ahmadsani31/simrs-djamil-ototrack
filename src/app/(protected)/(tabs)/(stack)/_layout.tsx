import { Stack } from "expo-router";

export default function StackLayout() {

    return (
        <Stack screenOptions={{
            headerShown: false,
            headerTitleAlign: 'center',
            headerStyle: {
                backgroundColor: '#205781',
            },
        }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="home" />
            <Stack.Screen name="admin" />
        </Stack>
    )

}