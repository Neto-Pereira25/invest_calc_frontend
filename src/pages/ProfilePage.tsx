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
        return <div className={s.error} data-testid="profile-load-error">{error}</div>;
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
            const updatedName = name.trim();
            const updatedUser = await updateAuthenticatedUserName(updatedName);
            setUser({ ...updatedUser, name: updatedName });
            setName(updatedName);
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
        <div className={s.page} data-testid="profile-page">
            <header className={s.header}>
                <h1 className={s.title}>Perfil</h1>
                <p className={s.subtitle}>Visualize e atualize seus dados pessoais</p>
            </header>

            <div className={s.container}>
                {/* Profile Card */}
                <div className={s.profileCard}>
                    <div className={s.avatarLarge} data-testid="profile-avatar">{avatarLetter}</div>
                    <div className={s.profileInfo}>
                        <div className={s.userName} data-testid="profile-card-name">{displayName}</div>
                        <div className={s.userEmail} data-testid="profile-card-email">{displayEmail}</div>
                        <div className={s.userRole} data-testid="profile-card-role">
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
                                    data-testid="profile-name-input"
                                    className={s.input}
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Digite seu nome"
                                />
                            ) : (
                                <span className={s.detailValue} data-testid="profile-detail-name">{displayName}</span>
                            )}
                        </div>

                        <div className={s.detailItem}>
                            <span className={s.detailLabel}>E-mail</span>
                            <span className={s.detailValue} data-testid="profile-detail-email">{displayEmail}</span>
                        </div>

                        <div className={s.detailItem}>
                            <span className={s.detailLabel}>Tipo de Conta</span>
                            <span className={s.detailValue} data-testid="profile-detail-role">
                                {displayRole === 'ADMIN' ? '👑 Administrador' : '👤 Usuário'}
                            </span>
                        </div>

                        <div className={s.detailItem}>
                            <span className={s.detailLabel}>ID do Usuário</span>
                            <span className={s.detailValue} data-testid="profile-detail-id">{user?.id || 'N/A'}</span>
                        </div>
                    </div>

                    {success && <div className={s.messageSuccess} data-testid="profile-success">{success}</div>}
                    {error && user && <div className={s.messageError} data-testid="profile-error">{error}</div>}

                    <div className={s.actions}>
                        {isEditing ? (
                            <>
                                <button
                                    data-testid="profile-save"
                                    className={`${s.button} ${s.buttonPrimary}`}
                                    onClick={handleSave}
                                    disabled={saving}
                                    type="button"
                                >
                                    {saving ? 'Salvando...' : 'Salvar alterações'}
                                </button>
                                <button
                                    data-testid="profile-cancel"
                                    className={s.button}
                                    onClick={handleCancel}
                                    type="button"
                                >
                                    Cancelar
                                </button>
                            </>
                        ) : (
                            <button
                                data-testid="profile-edit"
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
