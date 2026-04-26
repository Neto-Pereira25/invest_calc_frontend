import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import s from '../styles/forms.module.css';
import { api } from '../lib/api';
import { useUIStore } from '../store/uiStore';

const registerSchema = z
    .object({
        name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
        email: z.string().email({ message: 'E-mail inválido' }),
        password: z.string().min(8, { message: 'Senha deve ter no mínimo 8 caracteres' }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'As senhas não coincidem',
        path: ['confirmPassword'],
    });

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
};

export default function RegisterPage() {
    const nav = useNavigate();
    const setLoading = useUIStore((state) => state.setLoading);

    const [form, setForm] = useState<RegisterForm>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [error, setError] = useState('');

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        const result = registerSchema.safeParse(form);

        if (!result.success) {
            setError(result.error.issues[0]?.message ?? 'Dados inválidos.');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/register', {
                name: form.name,
                email: form.email,
                password: form.password,
            });

            // UX melhor: voltar para login
            nav('/');
        } catch {
            setError('Erro ao criar conta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={s.authWrap}>
            <div className={s.card}>
                <div className={s.brand}>
                    <div className={s.logo}>IC</div>
                    <div className={s.brandName}>InvestCalc</div>
                </div>

                <h1 className={s.title}>Crie sua conta</h1>
                <p className={s.subtitle}>
                    Comece a organizar suas finanças hoje
                </p>

                <form onSubmit={onSubmit}>
                    {error && <div className={s.error}>{error}</div>}

                    <div className={s.field}>
                        <label className={s.label}>Nome</label>
                        <input
                            className={s.input}
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            placeholder='Seu nome'
                        />
                    </div>

                    <div className={s.field}>
                        <label className={s.label}>E-mail</label>
                        <input
                            className={s.input}
                            type='email'
                            value={form.email}
                            onChange={(e) =>
                                setForm({ ...form, email: e.target.value })
                            }
                            placeholder='voce@email.com'
                        />
                    </div>

                    <div className={s.field}>
                        <label className={s.label}>Senha</label>
                        <input
                            className={s.input}
                            type='password'
                            value={form.password}
                            onChange={(e) =>
                                setForm({ ...form, password: e.target.value })
                            }
                            placeholder='Mínimo 6 caracteres'
                        />
                    </div>

                    <div className={s.field}>
                        <label className={s.label}>Confirmar senha</label>
                        <input
                            className={s.input}
                            type='password'
                            value={form.confirmPassword}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    confirmPassword: e.target.value,
                                })
                            }
                            placeholder='Repita a senha'
                        />
                    </div>

                    <button className={s.btn}>
                        Criar conta
                    </button>
                </form>

                <div className={s.alt}>
                    Já tem conta? <Link to='/'>Entrar</Link>
                </div>
            </div>
        </div>
    );
}