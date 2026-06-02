import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../lib/passwordRecoveryService';
import { ResetPasswordSchema } from '../lib/schemas/authSchema';
import { useUIStore } from '../store/uiStore';
import s from '../styles/forms.module.css';

type ResetPasswordForm = {
    token: string;
    password: string;
    confirmPassword: string;
};

export default function ResetPasswordPage() {
    const nav = useNavigate();
    const [searchParams] = useSearchParams();
    const setLoading = useUIStore((state) => state.setLoading);
    const tokenFromQuery = searchParams.get('token') ?? '';

    const [form, setForm] = useState<ResetPasswordForm>({
        token: tokenFromQuery,
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');

        const result = ResetPasswordSchema.safeParse(form);

        if (!result.success) {
            setError(result.error.issues[0]?.message ?? 'Dados inválidos.');
            return;
        }

        setLoading(true);

        try {
            await resetPassword({
                token: result.data.token,
                password: result.data.password,
            });

            nav('/');
        } catch {
            setError('Não foi possível redefinir a senha. Verifique o token e tente novamente.');
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

                <h1 className={s.title}>Redefinir senha</h1>
                <p className={s.subtitle}>Preencha o token e sua nova senha</p>

                <form noValidate onSubmit={onSubmit}>
                    {error && <div data-testid="reset-password-error" className={s.error}>{error}</div>}

                    <div className={s.field}>
                        <label className={s.label}>Token</label>
                        <input
                            data-testid="reset-password-token"
                            className={s.input}
                            value={form.token}
                            onChange={(event) =>
                                setForm({ ...form, token: event.target.value })
                            }
                            placeholder="Cole o token aqui"
                        />
                    </div>

                    <div className={s.field}>
                        <label className={s.label}>Nova senha</label>
                        <input
                            data-testid="reset-password-new-password"
                            className={s.input}
                            type="password"
                            value={form.password}
                            onChange={(event) =>
                                setForm({ ...form, password: event.target.value })
                            }
                            placeholder="Mínimo 8 caracteres"
                        />
                    </div>

                    <div className={s.field}>
                        <label className={s.label}>Confirmar senha</label>
                        <input
                            data-testid="reset-password-confirm-password"
                            className={s.input}
                            type="password"
                            value={form.confirmPassword}
                            onChange={(event) =>
                                setForm({ ...form, confirmPassword: event.target.value })
                            }
                            placeholder="Repita a nova senha"
                        />
                    </div>

                    <button data-testid="reset-password-submit" className={s.btn} type="submit">
                        Redefinir senha
                    </button>
                </form>

                <div className={s.alt}>
                    Lembrou sua senha? <Link to="/">Voltar para login</Link>
                </div>
            </div>
        </div>
    );
}
