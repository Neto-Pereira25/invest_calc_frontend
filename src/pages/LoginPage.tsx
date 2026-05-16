import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import {
    loginSchema,
    type LoginFormData,
} from '../schemas/authSchema';
import { successToast, errorToast } from '../components/ui/toast';
import s from '../styles/forms.module.css';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

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

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    async function onSubmit(data: LoginFormData) {
        setLoading(true);

        try {
            const response = await api.post<LoginResponse>(
                '/auth/login',
                data
            );

            const { token, refreshToken } = response.data.data;

            setAuth(token, refreshToken);

            successToast('Login realizado com sucesso!');

            nav('/dashboard');
        } catch (ex) {
            if (ex instanceof AxiosError) {
                errorToast(
                    ex.response?.data?.message ??
                    'Erro ao fazer login.'
                );

                return;
            }

            errorToast('Erro ao fazer login.');
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

                <h1 className={s.title}>
                    Bem-vindo(a) ao InvestCalc
                </h1>
                <p className={s.subtitle}>
                    Acesse sua conta para continuar
                </p>

                <form
                    noValidate
                    onSubmit={handleSubmit(onSubmit)}>
                    {/* EMAIL */}
                    <div className={s.field}>
                        <label className={s.label}>
                            E-mail
                        </label>

                        <input
                            data-testid="login-email"
                            className={`${s.input} ${errors.email ? s.inputError : ''}`}
                            type="email"
                            placeholder="seuemail@email.com"
                            {...register('email')}
                        />

                        {errors.email && (
                            <div className={s.error}>
                                {errors.email.message}
                            </div>
                        )}
                    </div>

                    {/* SENHA */}
                    <div className={s.field}>
                        <label className={s.label}>
                            Senha
                        </label>

                        <input
                            data-testid="login-password"
                            className={`${s.input} ${errors.password ? s.inputError : ''}`}
                            type="password"
                            placeholder="********"
                            {...register('password')}
                        />

                        {errors.password && (
                            <div className={s.error}>
                                {errors.password.message}
                            </div>
                        )}
                    </div>

                    <button
                        data-testid="login-submit"
                        className={s.btn}
                        type='submit'
                        disabled={isSubmitting}>
                        {isSubmitting ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <div className={s.alt}>
                    Ainda não tem conta? <Link to='/register'>Criar conta</Link>
                </div>
            </div>
        </div>
    );
}