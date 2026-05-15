import { useEffect, useMemo, useState } from 'react';
import Loading from '../components/Loading';
import { getUserProfile, updateAuthenticatedUserName } from '../lib/userService';
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
    const [name, setName] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const decodedToken = useMemo(() => decodeToken(token), [token]);

    useEffect(() => {
        async function fetchProfile() {
            try {
                setLoading(true);
                const profileData = await getUserProfile();
                setUser(profileData);
                setName(
                    profileData.name || decodedToken?.name || decodedToken?.username || '',
                );
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

    if (error && !user) {
        return <div className={s.error}>{error}</div>;
    }

    const displayName = name.trim() || user?.name || decodedToken?.name || decodedToken?.username || 'Usuario';
    const displayEmail = user?.email || decodedToken?.email || decodedToken?.sub || 'email@email.com';
    const displayRole = user?.role || decodedToken?.role || 'USER';
    const avatarLetter = displayName.charAt(0).toUpperCase();

    async function handleSave() {
        if (!name.trim() || !user) {
            setError('Informe um nome válido para atualizar.');
            setSuccess(null);
            return;
        }

        try {
            setSaving(true);
            setError(null);
            const updatedUser = await updateAuthenticatedUserName(name.trim());
            setUser(updatedUser);
            setSuccess('Nome do usuário atualizado com sucesso.');
            setIsEditing(false);
        } catch (err) {
            console.error('Erro ao atualizar nome:', err);
            setError('Não foi possível atualizar o nome. Tente novamente.');
            setSuccess(null);
        } finally {
            setSaving(false);
        }
    }

    function handleCancel() {
        setName(user?.name || decodedToken?.name || decodedToken?.username || '');
        setError(null);
        setSuccess(null);
        setIsEditing(false);
    }

    return (
        <div className={s.page}>
            <header className={s.header}>
                <h1 className={s.title}>Perfil</h1>
                <p className={s.subtitle}>Visualize e atualize seus dados pessoais</p>
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
                            {isEditing ? (
                                <input
                                    className={s.input}
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Digite seu nome"
                                />
                            ) : (
                                <span className={s.detailValue}>{displayName}</span>
                            )}
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

                    {success && <div className={s.messageSuccess}>{success}</div>}
                    {error && user && <div className={s.messageError}>{error}</div>}

                    <div className={s.actions}>
                        {isEditing ? (
                            <>
                                <button
                                    className={`${s.button} ${s.buttonPrimary}`}
                                    onClick={handleSave}
                                    disabled={saving}
                                    type="button"
                                >
                                    {saving ? 'Salvando...' : 'Salvar alterações'}
                                </button>
                                <button
                                    className={s.button}
                                    onClick={handleCancel}
                                    type="button"
                                >
                                    Cancelar
                                </button>
                            </>
                        ) : (
                            <button
                                className={`${s.button} ${s.buttonPrimary}`}
                                onClick={() => {
                                    setIsEditing(true);
                                    setSuccess(null);
                                    setError(null);
                                }}
                                type="button"
                            >
                                Editar perfil
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
