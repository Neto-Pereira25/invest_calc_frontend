import { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from 'react-bootstrap';
import { errorToast, successToast } from '../../components/ui/toast';
import {
    getCurrentFinancialProfile,
    getFinancialProfileHistory,
    submitFinancialProfileAssessment,
} from '../../lib/financialProfileService';
import {
    financialProfileSchema,
    type FinancialProfileFormData,
} from '../../schemas/financialProfileSchema';
import type {
    FinancialProfileHistoryItem,
    FinancialProfileOption,
    FinancialProfileResponse,
} from '../../types/financialProfile';
import {
    FINANCIAL_PROFILE_QUESTIONNAIRE,
    type FinancialProfileQuestion,
} from './financialProfileQuestionnaire';
import s from './FinancialProfilePage.module.css';
import '../../styles/modal.css';

const FORM_KEYS = [
    'q1',
    'q2',
    'q3',
    'q4',
    'q5',
    'q6',
    'q7',
    'q8',
    'q9',
    'q10',
] as const;

const PROFILE_LABELS: Record<FinancialProfileResponse['profile'], string> = {
    DEVEDOR: 'Devedor',
    GASTADOR: 'Gastador',
    DESLIGADO: 'Desligado',
    POUPADOR: 'Poupador',
    INVESTIDOR: 'Investidor',
};

function formatDateTime(date: string): string {
    return new Date(date).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function normalizeErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
        const data = error.response?.data as { message?: string; data?: string[] } | undefined;

        if (Array.isArray(data?.data) && data.data.length > 0) {
            return data.data[0];
        }

        if (data?.message) {
            return data.message;
        }
    }

    return 'Erro ao processar perfil financeiro.';
}

function buildPayload(data: FinancialProfileFormData) {
    return {
        answers: FORM_KEYS.map((key, index) => ({
            questionNumber: index + 1,
            selectedOption: data[key] as FinancialProfileOption,
        })),
    };
}

function QuestionCard({
    question,
    register,
    error,
}: {
    question: FinancialProfileQuestion;
    register: ReturnType<typeof useForm<FinancialProfileFormData>>['register'];
    error?: string;
}) {
    const fieldName = `q${question.number}` as keyof FinancialProfileFormData;

    return (
        <fieldset className={s.questionCard}>
            <legend className={s.questionLegend}>Pergunta {question.number}</legend>
            <p className={s.questionTitle}>{question.title}</p>

            <div className={s.optionsGrid}>
                {question.options.map((option) => (
                    <label key={option.value} className={s.optionItem}>
                        <input
                            className={s.optionInput}
                            type="radio"
                            value={option.value}
                            {...register(fieldName)}
                        />

                        <div className={s.optionBody}>
                            <div className={s.optionLabel}>
                                <span className={s.optionLetter}>{option.value})</span>
                                <span>{option.label}</span>
                            </div>
                        </div>
                    </label>
                ))}
            </div>

            {error && <p className={s.fieldError}>{error}</p>}
        </fieldset>
    );
}

export default function FinancialProfilePage() {
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [currentProfile, setCurrentProfile] = useState<FinancialProfileResponse | null>(null);
    const [history, setHistory] = useState<FinancialProfileHistoryItem[]>([]);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FinancialProfileFormData>({
        resolver: zodResolver(financialProfileSchema),
    });

    useEffect(() => {
        async function loadData() {
            try {
                setIsInitialLoading(true);

                const [profileResult, historyResult] = await Promise.all([
                    getCurrentFinancialProfile().catch((error: unknown) => {
                        if (error instanceof AxiosError && error.response?.status === 404) {
                            return null;
                        }
                        throw error;
                    }),
                    getFinancialProfileHistory(),
                ]);

                setCurrentProfile(profileResult);
                setHistory(historyResult);
                setLoadError(null);
            } catch (error) {
                setLoadError(normalizeErrorMessage(error));
            } finally {
                setIsInitialLoading(false);
            }
        }

        loadData();
    }, []);

    const scoreRows = useMemo(() => {
        if (!currentProfile) {
            return [];
        }

        return [
            {
                label: 'Devedor',
                score: currentProfile.devedorScore,
                percentage: currentProfile.devedorPercentage,
            },
            {
                label: 'Gastador',
                score: currentProfile.gastadorScore,
                percentage: currentProfile.gastadorPercentage,
            },
            {
                label: 'Desligado',
                score: currentProfile.desligadoScore,
                percentage: currentProfile.desligadoPercentage,
            },
            {
                label: 'Poupador',
                score: currentProfile.poupadorScore,
                percentage: currentProfile.poupadorPercentage,
            },
            {
                label: 'Investidor',
                score: currentProfile.investidorScore,
                percentage: currentProfile.investidorPercentage,
            },
        ];
    }, [currentProfile]);

    const onSubmit = async (data: FinancialProfileFormData) => {
        try {
            const response = await submitFinancialProfileAssessment(buildPayload(data));

            setCurrentProfile(response);
            setHistory(await getFinancialProfileHistory());
            setIsQuestionnaireOpen(false);
            successToast('Perfil financeiro calculado com sucesso!');
        } catch (error) {
            errorToast(normalizeErrorMessage(error));
        }
    };

    function openQuestionnaireModal() {
        reset();
        setIsQuestionnaireOpen(true);
    }

    return (
        <div className={s.page}>
            <header className={s.header}>
                <h1 className={s.title}>Perfil Financeiro</h1>
                <p className={s.subtitle}>Veja seu resultado e refaça o questionário quando quiser.</p>
            </header>

            {loadError && <div className={s.alertError}>{loadError}</div>}

            <section className={s.resultCard}>
                <div className={s.resultTopBar}>
                    <h2 className={s.sectionTitle}>Resultado Atual</h2>
                    <button
                        className={s.primaryButton}
                        type="button"
                        onClick={openQuestionnaireModal}
                        disabled={isInitialLoading}
                    >
                        {currentProfile ? 'Recalcular perfil' : 'Calcular perfil'}
                    </button>
                </div>

                {!currentProfile ? (
                    <p className={s.emptyState}>Você ainda não possui um perfil calculado. Clique em "Calcular perfil" para iniciar o questionário.</p>
                ) : (
                    <>
                        <div className={s.resultHeader}>
                            <div>
                                <div className={s.resultLabel}>Perfil predominante</div>
                                <div className={s.resultProfile}>{PROFILE_LABELS[currentProfile.profile]}</div>
                            </div>

                            <div className={s.resultDate}>Avaliação: {formatDateTime(currentProfile.assessedAt)}</div>
                        </div>

                        <p className={s.resultDescription}>{currentProfile.description}</p>

                        <div className={s.scoreGrid}>
                            {scoreRows.map((row) => (
                                <div key={row.label} className={s.scoreItem}>
                                    <div className={s.scoreLine}>
                                        <span>{row.label}</span>
                                        <span>
                                            {row.score} pts ({row.percentage.toFixed(2)}%)
                                        </span>
                                    </div>
                                    <div className={s.progressTrack}>
                                        <div className={s.progressFill} style={{ width: `${row.percentage}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={s.detailsGrid}>
                            <div className={s.detailBlock}>
                                <h3>Pontos fortes</h3>
                                <ul>
                                    {currentProfile.strengths.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className={s.detailBlock}>
                                <h3>Limitações</h3>
                                <ul>
                                    {currentProfile.limitations.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className={s.detailBlock}>
                                <h3>Recomendações</h3>
                                <ul>
                                    {currentProfile.recommendations.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className={s.detailBlock}>
                                <h3>Metas sugeridas</h3>
                                <ul>
                                    {currentProfile.suggestedGoals.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </>
                )}
            </section>

            <section className={s.historyCard}>
                <h2 className={s.sectionTitle}>Histórico</h2>

                {history.length === 0 ? (
                    <p className={s.emptyState}>Sem avaliações anteriores.</p>
                ) : (
                    <ul className={s.historyList}>
                        {history.map((item) => (
                            <li key={item.id} className={s.historyItem}>
                                <span className={s.historyProfile}>{PROFILE_LABELS[item.profile]}</span>
                                <span className={s.historyDate}>{formatDateTime(item.assessedAt)}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <Modal
                show={isQuestionnaireOpen}
                onHide={() => setIsQuestionnaireOpen(false)}
                centered
                size="lg"
                scrollable
            >
                <Modal.Header closeButton>
                    <Modal.Title>Questionário de Perfil Financeiro</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className={s.formHeader}>
                        <p className={s.sectionDescription}>São 10 perguntas objetivas sobre seus hábitos financeiros.</p>
                    </div>

                    <form className={s.form} onSubmit={handleSubmit(onSubmit)}>
                        {FINANCIAL_PROFILE_QUESTIONNAIRE.map((question) => {
                            const fieldName = `q${question.number}` as keyof FinancialProfileFormData;
                            return (
                                <QuestionCard
                                    key={question.number}
                                    question={question}
                                    register={register}
                                    error={errors[fieldName]?.message}
                                />
                            );
                        })}

                        <div className={s.formActions}>
                            <button className={s.primaryButton} type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Calculando perfil...' : 'Calcular perfil financeiro'}
                            </button>

                            <button
                                className={s.secondaryButton}
                                type="button"
                                onClick={() => reset()}
                                disabled={isSubmitting}
                            >
                                Reiniciar respostas
                            </button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        </div>
    );
}