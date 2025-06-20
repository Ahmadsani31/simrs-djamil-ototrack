import { useAuthStore } from '@/stores/authStore';
import { Redirect } from 'expo-router';

export default function IndexScreen() {
  const user = useAuthStore((state) => state.user);
  
  console.log('role', user?.role);

  if (user?.role === 'admin') {
    return <Redirect href={'admin'} />;
  } else {
    return <Redirect href={'home'} />;
  }
}
