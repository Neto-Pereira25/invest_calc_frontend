import Layout from './Layout';
import PublicLayout from './PublicLayout';
import { useAuthStore } from '../store/authStore';

export default function AuthAwareLayout() {
    const token = useAuthStore((state) => state.token);

    return token ? <Layout /> : <PublicLayout />;
}
