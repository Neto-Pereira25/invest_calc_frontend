import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../lib/api';
import { useUIStore } from '../store/uiStore';
import {
    registerSchema,
    type RegisterFormData,
} from '../schemas/authSchema';
import { successToast, errorToast } from '../components/ui/toast';
import s from '../styles/forms.module.css';

export default function RegisterPage() {
    const nav = useNavigate();
    const setLoading = useUIStore((state) => state.setLoading);

    const {
        register,
        handleSubmit,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),

        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        setLoading(true);

        try {
            await api.post('/auth/register', {
                name: data.name,
                email: data.email,
                password: data.password,
            });

            successToast(
                'Conta criada com sucesso!'
            );

            nav('/login');
        } catch (ex) {
            if (ex instanceof AxiosError) {
                errorToast(
                    ex.response?.data?.message ??
                    'Erro ao criar conta.'
                );

                return;
            }

            errorToast(
                'Erro ao criar conta.'
            );
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

                <form
                    noValidate
                    onSubmit={handleSubmit(onSubmit)}
                >
                    {/* NOME */}
                    <div className={s.field}>
                        <label className={s.label}>
                            Nome
                        </label>

                        <input
                            data-testid="register-name"
                            className={`${s.input} ${errors.name
                                ? s.inputError
                                : ''
                                }`}
                            placeholder="Seu nome"
                            {...register('name')}
                        />

                        {errors.name && (
                            <div className={s.error}>
                                {errors.name.message}
                            </div>
                        )}
                    </div>

                    {/* EMAIL */}
                    <div className={s.field}>
                        <label className={s.label}>
                            E-mail
                        </label>

                        <input
                            data-testid="register-email"
                            className={`${s.input} ${errors.email
                                ? s.inputError
                                : ''
                                }`}
                            type="email"
                            placeholder="voce@email.com"
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
                            data-testid="register-password"
                            className={`${s.input} ${errors.password
                                ? s.inputError
                                : ''
                                }`}
                            type="password"
                            placeholder="Mínimo 8 caracteres"
                            {...register('password')}
                        />

                        {errors.password && (
                            <div className={s.error}>
                                {errors.password.message}
                            </div>
                        )}
                    </div>

                    {/* CONFIRMAR SENHA */}
                    <div className={s.field}>
                        <label className={s.label}>
                            Confirmar senha
                        </label>

                        <input
                            data-testid="register-confirm-password"
                            className={`${s.input} ${errors.confirmPassword
                                ? s.inputError
                                : ''
                                }`}
                            type="password"
                            placeholder="Repita a senha"
                            {...register(
                                'confirmPassword'
                            )}
                        />

                        {errors.confirmPassword && (
                            <div className={s.error}>
                                {
                                    errors.confirmPassword
                                        .message
                                }
                            </div>
                        )}
                    </div>

                    <button
                        data-testid="register-submit"
                        className={s.btn}
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? 'Criando conta...'
                            : 'Criar conta'}
                    </button>
                </form>

                <div className={s.alt}>
                    Já tem conta? <Link to='/login'>Entrar</Link>
                </div>
            </div>
        </div>
    );
}