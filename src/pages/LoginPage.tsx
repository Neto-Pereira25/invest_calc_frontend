import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import s from '../styles/forms.module.css';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

const loginSchema = z.object({
    email: z.string().email({ message: 'E-mail inválido' }),
    password: z.string().min(6, { message: 'Senha obrigatória' }),
});

type LoginResponse = {
    data: {
        token: string;
        refreshToken: string;
        message: string;
    }
};

export default function LoginPage() {
    const setAuth = useAuthStore((state) => state.setAuth);
    const setLoading = useUIStore((state) => state.setLoading);

    const nav = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');

        const result = loginSchema.safeParse({ email, password });

        if (!result.success) {
            setError(result.error.issues[0]?.message ?? 'Dados inválidos.');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post<LoginResponse>('/auth/login', {
                email,
                password,
            });

            const { token, refreshToken } = response.data.data;

            setAuth(token, refreshToken);

            nav('/dashboard');
        } catch {
            setError('E-mail ou senha inválidos');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={s.authWrap}>
            <div className={s.card}>
                <div className={s.brand}>
                    <div className={s.logo}>IC</div>
                    <div className={s.brandName}>InvestCalc</div>
                </div>

                <h1 className={s.title}>Bem-vindo(a) ao InvestCalc</h1>
                <p className={s.subtitle}>Acesse sua conta para continuar</p>

                <form onSubmit={onSubmit}>
                    {error && <div className={s.error}>{error}</div>}

                    <div className={s.field}>
                        <label className={s.label}>E-mail</label>
                        <input
                            className={s.input}
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='seuemail@email.com'
                        />
                    </div>

                    <div className={s.field}>
                        <label className={s.label}>Senha</label>
                        <input
                            className={s.input}
                            type='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder='••••••••'
                        />
                    </div>

                    <button className={s.btn}>
                        'Entrar'
                    </button>
                </form>

                <div className={s.alt}>
                    Ainda não tem conta? <Link to='/register'>Criar conta</Link>
                </div>
            </div>
        </div>
    );
}