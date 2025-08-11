import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home', headerShown: false }} />
      <Stack.Screen
        name="pemiliharaan-nested"
        options={{ title: 'pemeliharaan Nested', headerShown: false }}
      />
    </Stack>
  );
}
