import { useAuthStore } from "@/stores/authStore";
import { Redirect, router, Slot } from "expo-router";

export default function AdminLayout() {
    const user = useAuthStore((state) => state.user);

    if (user?.role != 'admin') {
        return <Redirect href={'/(driver)'} />;
    }
    return (
        <Slot />
    )

}