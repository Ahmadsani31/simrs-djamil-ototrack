import { useAuthStore } from "@/stores/authStore";
import { Redirect, router, Slot, Stack } from "expo-router";

export default function DriverLayout() {
    const user = useAuthStore((state) => state.user);

    if (user?.role != 'driver') {
        return <Redirect href={'/(admin)'} />;
    }
    console.log('role', user?.role);
    return (
        <Slot />
    )

}