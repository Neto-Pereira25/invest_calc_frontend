import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ForgotPasswordSchema } from '../lib/schemas/authSchema';
import { requestPasswordRecovery } from '../lib/passwordRecoveryService';
import { useUIStore } from '../store/uiStore';
import s from '../styles/forms.module.css';

export default function ForgotPasswordPage() {
    const nav = useNavigate();
    const setLoading = useUIStore((state) => state.setLoading);

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');

        const result = ForgotPasswordSchema.safeParse({ email });

        if (!result.success) {
            setError(result.error.issues[0]?.message ?? 'Dados inválidos.');
            return;
        }

        setLoading(true);

        try {
            await requestPasswordRecovery({ email: result.data.email });
            nav('/reset-password');
        } catch {
            setError('Não foi possível solicitar a recuperação de senha. Tente novamente.');
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

                <h1 className={s.title}>Recuperar senha</h1>
                <p className={s.subtitle}>Informe o e-mail da sua conta para continuar</p>

                <form noValidate onSubmit={onSubmit}>
                    {error && <div data-testid="forgot-password-error" className={s.error}>{error}</div>}

                    <div className={s.field}>
                        <label className={s.label}>E-mail</label>
                        <input
                            data-testid="forgot-password-email"
                            className={s.input}
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="seuemail@email.com"
                        />
                    </div>

                    <button data-testid="forgot-password-submit" className={s.btn} type="submit">
                        Solicitar recuperação
                    </button>
                </form>

                <div className={s.alt}>
                    Lembrou sua senha? <Link to="/">Voltar para login</Link>
                </div>
            </div>
        </div>
    );
}
