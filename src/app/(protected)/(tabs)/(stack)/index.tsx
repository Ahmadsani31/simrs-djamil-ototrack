import { useAuthStore } from '@/stores/authStore';
import HomeScreen from './home';
import AdminScreen from './admin';

export default function IndexScreen() {
    const user = useAuthStore((state) => state.user);
    console.log('role', user?.role);
    if (user?.role === "admin") {
        return <AdminScreen />;
    } else if (user?.role === "driver") {
        return <HomeScreen />;
    }
}
