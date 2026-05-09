import { useEffect, useMemo, useState } from 'react';
import Loading from '../components/Loading';
import { getUserProfile } from '../lib/userService';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types/user';
import s from './ProfilePage.module.css';

type DecodedToken = {
    name?: string;
    username?: string;
    email?: string;
    sub?: string;
    role?: string;
};

function decodeToken(token: string | null): DecodedToken | null {
    if (!token) {
        return null;
    }

    try {
        const payload = token.split('.')[1];
        if (!payload) {
            return null;
        }

        const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(json) as DecodedToken;
    } catch {
        return null;
    }
}

export default function ProfilePage() {
    const token = useAuthStore((state) => state.token);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const decodedToken = useMemo(() => decodeToken(token), [token]);

    useEffect(() => {
        async function fetchProfile() {
            try {
                setLoading(true);
                const profileData = await getUserProfile();
                setUser(profileData);
                setError(null);
            } catch (err) {
                console.error('Erro ao buscar perfil:', err);
                setError('Não foi possível carregar seu perfil. Tente novamente mais tarde.');
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, []);

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <div className={s.error}>{error}</div>;
    }

    const displayName = user?.name || decodedToken?.name || decodedToken?.username || 'Usuario';
    const displayEmail = user?.email || decodedToken?.email || decodedToken?.sub || 'email@email.com';
    const displayRole = user?.role || decodedToken?.role || 'USER';
    const avatarLetter = displayName.charAt(0).toUpperCase();

    return (
        <div className={s.page}>
            <header className={s.header}>
                <h1 className={s.title}>Perfil</h1>
                <p className={s.subtitle}>Visualize seus dados pessoais</p>
            </header>

            <div className={s.container}>
                {/* Profile Card */}
                <div className={s.profileCard}>
                    <div className={s.avatarLarge}>{avatarLetter}</div>
                    <div className={s.profileInfo}>
                        <div className={s.userName}>{displayName}</div>
                        <div className={s.userEmail}>{displayEmail}</div>
                        <div className={s.userRole}>
                            {displayRole === 'ADMIN' ? 'Administrador' : 'Usuário'}
                        </div>
                    </div>
                </div>

                {/* Details Card */}
                <div className={s.detailsCard}>
                    <h2 className={s.sectionTitle}>Informações Pessoais</h2>
                    <div className={s.detailsList}>
                        <div className={s.detailItem}>
                            <span className={s.detailLabel}>Nome</span>
                            <span className={s.detailValue}>{displayName}</span>
                        </div>

                        <div className={s.detailItem}>
                            <span className={s.detailLabel}>E-mail</span>
                            <span className={s.detailValue}>{displayEmail}</span>
                        </div>

                        <div className={s.detailItem}>
                            <span className={s.detailLabel}>Tipo de Conta</span>
                            <span className={s.detailValue}>
                                {displayRole === 'ADMIN' ? '👑 Administrador' : '👤 Usuário'}
                            </span>
                        </div>

                        <div className={s.detailItem}>
                            <span className={s.detailLabel}>ID do Usuário</span>
                            <span className={s.detailValue}>{user?.id || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
