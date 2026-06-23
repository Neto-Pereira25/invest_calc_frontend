import { useState } from 'react';
import { Button, Card, Form, InputGroup, Spinner } from 'react-bootstrap';
import { FiBarChart2, FiClock, FiDollarSign, FiRefreshCw, FiTarget, FiTrash2 } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import styles from './ReverseSimulationPage.module.css';
import { reverseSimulationService } from '../lib/reverseSimulationService';
import type { ReverseSimulationResponse } from '../types/reverseSimulation';
import { ReverseSimulationMode } from '../types/reverseSimulation';
import { RateInputType, RateType, PeriodType } from '../types/retirementSimulator';
import InterestRateConverterModal from '../components/InterestRateConverterModal';
import { errorToast, successToast } from '../components/ui/toast';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
});

const parseLocaleNumber = (value: string): number => {
    if (value.includes(',')) {
        return parseFloat(value.replace(/\./g, '').replace(',', '.'));
    }
    return parseFloat(value);
};

const contributionSchema = z.object({
    targetAmount: z
        .string()
        .min(1, 'Valor objetivo é obrigatório')
        .refine((val) => !isNaN(parseLocaleNumber(val)) && parseLocaleNumber(val) > 0, 'Deve ser um valor maior que zero'),
    interestRate: z
        .string()
        .min(1, 'Taxa de juros é obrigatória')
        .refine((val) => !isNaN(parseLocaleNumber(val)) && parseLocaleNumber(val) > 0, 'Deve ser maior que zero'),
    rateType: z.enum([RateType.YEARLY, RateType.MONTHLY]),
    period: z
        .string()
        .min(1, 'Período é obrigatório')
        .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, 'Deve ser um número maior que zero'),
    periodType: z.enum([PeriodType.ANNUAL, PeriodType.MONTHLY]),
});

const periodSchema = z.object({
    targetAmount: z
        .string()
        .min(1, 'Valor objetivo é obrigatório')
        .refine((val) => !isNaN(parseLocaleNumber(val)) && parseLocaleNumber(val) > 0, 'Deve ser um valor maior que zero'),
    interestRate: z
        .string()
        .min(1, 'Taxa de juros é obrigatória')
        .refine((val) => !isNaN(parseLocaleNumber(val)) && parseLocaleNumber(val) > 0, 'Deve ser maior que zero'),
    rateType: z.enum([RateType.YEARLY, RateType.MONTHLY]),
    monthlyContribution: z
        .string()
        .min(1, 'Aporte mensal é obrigatório')
        .refine((val) => !isNaN(parseLocaleNumber(val)) && parseLocaleNumber(val) > 0, 'Deve ser maior que zero'),
});

type ContributionFormData = z.infer<typeof contributionSchema>;
type PeriodFormData = z.infer<typeof periodSchema>;

export default function ReverseSimulationPage() {
    const [mode, setMode] = useState<keyof typeof ReverseSimulationMode>(
        ReverseSimulationMode.CALCULATE_CONTRIBUTION
    );
    const [result, setResult] = useState<ReverseSimulationResponse | null>(null);
    const [showRateConverter, setShowRateConverter] = useState(false);
    const [loading, setLoading] = useState(false);

    const contributionForm = useForm<ContributionFormData>({
        resolver: zodResolver(contributionSchema),
        defaultValues: {
            targetAmount: '',
            interestRate: '',
            rateType: RateType.YEARLY,
            period: '',
            periodType: PeriodType.ANNUAL,
        },
    });

    const periodForm = useForm<PeriodFormData>({
        resolver: zodResolver(periodSchema),
        defaultValues: {
            targetAmount: '',
            interestRate: '',
            rateType: RateType.YEARLY,
            monthlyContribution: '',
        },
    });

    const handleModeChange = (newMode: keyof typeof ReverseSimulationMode) => {
        setMode(newMode);
        setResult(null);
    };

    const onSubmitContribution = async (formData: ContributionFormData) => {
        try {
            setLoading(true);
            const data = await reverseSimulationService.simulate({
                targetAmount: parseLocaleNumber(formData.targetAmount),
                interestRate: parseLocaleNumber(formData.interestRate),
                rateType: formData.rateType,
                interestRateInputType: RateInputType.PERCENTAGE,
                mode: ReverseSimulationMode.CALCULATE_CONTRIBUTION,
                period: parseInt(formData.period),
                periodType: formData.periodType,
            });
            setResult(data);
            successToast('Simulação realizada com sucesso!');
        } catch {
            errorToast('Ocorreu um erro ao realizar a simulação. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const onSubmitPeriod = async (formData: PeriodFormData) => {
        try {
            setLoading(true);
            const data = await reverseSimulationService.simulate({
                targetAmount: parseLocaleNumber(formData.targetAmount),
                interestRate: parseLocaleNumber(formData.interestRate),
                rateType: formData.rateType,
                interestRateInputType: RateInputType.PERCENTAGE,
                mode: ReverseSimulationMode.CALCULATE_PERIOD,
                monthlyContribution: parseLocaleNumber(formData.monthlyContribution),
            });
            setResult(data);
            successToast('Simulação realizada com sucesso!');
        } catch {
            errorToast('Ocorreu um erro ao realizar a simulação. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        contributionForm.reset();
        periodForm.reset();
        setResult(null);
    };

    const handleApplyRate = (rate: number, rateType: string) => {
        const rateStr = String(rate).replace('.', ',');
        const rateTypeValue = rateType === 'MONTHLY' ? RateType.MONTHLY : RateType.YEARLY;
        contributionForm.setValue('interestRate', rateStr);
        contributionForm.setValue('rateType', rateTypeValue);
        periodForm.setValue('interestRate', rateStr);
        periodForm.setValue('rateType', rateTypeValue);
        setShowRateConverter(false);
    };

    const isContribution = mode === ReverseSimulationMode.CALCULATE_CONTRIBUTION;
    const contribErrors = contributionForm.formState.errors;
    const periodErrors = periodForm.formState.errors;

    return (
        <div className={styles.container} data-testid="reverse-simulation-page">
            <InterestRateConverterModal
                show={showRateConverter}
                onClose={() => setShowRateConverter(false)}
                onApply={handleApplyRate}
            />

            <div className={styles.title}>
                <FiTarget size={32} style={{ marginRight: '12px' }} />
                Simulação Reversa
            </div>
            <div className={styles.subtitle}>
                Descubra quanto poupar por mês para atingir um objetivo, ou em quanto tempo você chegará lá
            </div>

            <div className={styles.content}>
                {/* FORMULÁRIO */}
                <Card className={styles.formCard}>
                    <Card.Header className="bg-light border-bottom" style={{ padding: '16px' }}>
                        <h5 style={{ margin: 0 }}>Parâmetros da Simulação</h5>
                    </Card.Header>
                    <Card.Body>
                        {/* SELEÇÃO DE MODO */}
                        <div className={styles.modeToggle}>
                            <button
                                type="button"
                                data-testid="reverse-mode-contribution"
                                className={`${styles.modeButton} ${isContribution ? styles.modeButtonActive : ''}`}
                                onClick={() => handleModeChange(ReverseSimulationMode.CALCULATE_CONTRIBUTION)}
                            >
                                <FiDollarSign size={15} style={{ marginRight: '6px' }} />
                                Calcular Aporte
                            </button>
                            <button
                                type="button"
                                data-testid="reverse-mode-period"
                                className={`${styles.modeButton} ${!isContribution ? styles.modeButtonActive : ''}`}
                                onClick={() => handleModeChange(ReverseSimulationMode.CALCULATE_PERIOD)}
                            >
                                <FiClock size={15} style={{ marginRight: '6px' }} />
                                Calcular Prazo
                            </button>
                        </div>

                        {/* MODO: CALCULAR APORTE */}
                        {isContribution && (
                            <Form noValidate onSubmit={contributionForm.handleSubmit(onSubmitContribution)}>
                                <div className={styles.rowGroup}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Valor Objetivo *</label>
                                        <InputGroup>
                                            <InputGroup.Text>R$</InputGroup.Text>
                                            <Form.Control
                                                placeholder="100.000,00"
                                                data-testid="reverse-contribution-target-amount"
                                                {...contributionForm.register('targetAmount')}
                                                isInvalid={!!contribErrors.targetAmount}
                                            />
                                        </InputGroup>
                                        {contribErrors.targetAmount && (
                                            <div className={styles.helpText} style={{ color: '#dc3545' }}>
                                                {contribErrors.targetAmount.message}
                                            </div>
                                        )}
                                        <div className={styles.helpText}>Quanto você quer acumular</div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Taxa de Juros *</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <InputGroup style={{ flex: 1 }}>
                                                <InputGroup.Text>%</InputGroup.Text>
                                                <Form.Control
                                                    placeholder="12,00"
                                                    data-testid="reverse-contribution-interest-rate"
                                                    {...contributionForm.register('interestRate')}
                                                    isInvalid={!!contribErrors.interestRate}
                                                />
                                                <Form.Select
                                                    data-testid="reverse-contribution-rate-type"
                                                    {...contributionForm.register('rateType')}
                                                    style={{ maxWidth: '140px' }}
                                                >
                                                    <option value={RateType.YEARLY}>Anual</option>
                                                    <option value={RateType.MONTHLY}>Mensal</option>
                                                </Form.Select>
                                            </InputGroup>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                data-testid="reverse-contribution-rate-converter"
                                                onClick={() => setShowRateConverter(true)}
                                                style={{ whiteSpace: 'nowrap' }}
                                            >
                                                <FiRefreshCw size={16} />
                                            </Button>
                                        </div>
                                        {contribErrors.interestRate && (
                                            <div className={styles.helpText} style={{ color: '#dc3545' }}>
                                                {contribErrors.interestRate.message}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.rowGroup}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Período *</label>
                                        <InputGroup>
                                            <Form.Control
                                                type="number"
                                                placeholder="10"
                                                data-testid="reverse-contribution-period"
                                                {...contributionForm.register('period')}
                                                isInvalid={!!contribErrors.period}
                                            />
                                            <Form.Select
                                                data-testid="reverse-contribution-period-type"
                                                {...contributionForm.register('periodType')}
                                                style={{ maxWidth: '140px' }}
                                            >
                                                <option value={PeriodType.ANNUAL}>Anos</option>
                                                <option value={PeriodType.MONTHLY}>Meses</option>
                                            </Form.Select>
                                        </InputGroup>
                                        {contribErrors.period && (
                                            <div className={styles.helpText} style={{ color: '#dc3545' }}>
                                                {contribErrors.period.message}
                                            </div>
                                        )}
                                        <div className={styles.helpText}>Em quanto tempo quer atingir o objetivo</div>
                                    </div>
                                </div>

                                <div className={styles.buttonGroup}>
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        data-testid="reverse-contribution-submit"
                                        disabled={loading}
                                        style={{ fontSize: '1rem' }}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" style={{ marginRight: '8px' }} />
                                                Simulando...
                                            </>
                                        ) : (
                                            <>
                                                <FiBarChart2 size={18} style={{ marginRight: '8px' }} />
                                                Simular
                                            </>
                                        )}
                                    </Button>
                                    <Button variant="secondary" data-testid="reverse-contribution-clear" onClick={handleClear} disabled={loading} style={{ fontSize: '1rem' }}>
                                        <FiTrash2 size={18} style={{ marginRight: '8px' }} />
                                        Limpar
                                    </Button>
                                </div>
                            </Form>
                        )}

                        {/* MODO: CALCULAR PRAZO */}
                        {!isContribution && (
                            <Form noValidate onSubmit={periodForm.handleSubmit(onSubmitPeriod)}>
                                <div className={styles.rowGroup}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Valor Objetivo *</label>
                                        <InputGroup>
                                            <InputGroup.Text>R$</InputGroup.Text>
                                            <Form.Control
                                                placeholder="100.000,00"
                                                data-testid="reverse-period-target-amount"
                                                {...periodForm.register('targetAmount')}
                                                isInvalid={!!periodErrors.targetAmount}
                                            />
                                        </InputGroup>
                                        {periodErrors.targetAmount && (
                                            <div className={styles.helpText} style={{ color: '#dc3545' }}>
                                                {periodErrors.targetAmount.message}
                                            </div>
                                        )}
                                        <div className={styles.helpText}>Quanto você quer acumular</div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Taxa de Juros *</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <InputGroup style={{ flex: 1 }}>
                                                <InputGroup.Text>%</InputGroup.Text>
                                                <Form.Control
                                                    placeholder="12,00"
                                                    data-testid="reverse-period-interest-rate"
                                                    {...periodForm.register('interestRate')}
                                                    isInvalid={!!periodErrors.interestRate}
                                                />
                                                <Form.Select
                                                    data-testid="reverse-period-rate-type"
                                                    {...periodForm.register('rateType')}
                                                    style={{ maxWidth: '140px' }}
                                                >
                                                    <option value={RateType.YEARLY}>Anual</option>
                                                    <option value={RateType.MONTHLY}>Mensal</option>
                                                </Form.Select>
                                            </InputGroup>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                data-testid="reverse-period-rate-converter"
                                                onClick={() => setShowRateConverter(true)}
                                                style={{ whiteSpace: 'nowrap' }}
                                            >
                                                <FiRefreshCw size={16} />
                                            </Button>
                                        </div>
                                        {periodErrors.interestRate && (
                                            <div className={styles.helpText} style={{ color: '#dc3545' }}>
                                                {periodErrors.interestRate.message}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.rowGroup}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Aporte Mensal *</label>
                                        <InputGroup>
                                            <InputGroup.Text>R$</InputGroup.Text>
                                            <Form.Control
                                                placeholder="500,00"
                                                data-testid="reverse-period-monthly-contribution"
                                                {...periodForm.register('monthlyContribution')}
                                                isInvalid={!!periodErrors.monthlyContribution}
                                            />
                                        </InputGroup>
                                        {periodErrors.monthlyContribution && (
                                            <div className={styles.helpText} style={{ color: '#dc3545' }}>
                                                {periodErrors.monthlyContribution.message}
                                            </div>
                                        )}
                                        <div className={styles.helpText}>Quanto você pode poupar por mês</div>
                                    </div>
                                </div>

                                <div className={styles.buttonGroup}>
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        data-testid="reverse-period-submit"
                                        disabled={loading}
                                        style={{ fontSize: '1rem' }}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" style={{ marginRight: '8px' }} />
                                                Simulando...
                                            </>
                                        ) : (
                                            <>
                                                <FiBarChart2 size={18} style={{ marginRight: '8px' }} />
                                                Simular
                                            </>
                                        )}
                                    </Button>
                                    <Button variant="secondary" data-testid="reverse-period-clear" onClick={handleClear} disabled={loading} style={{ fontSize: '1rem' }}>
                                        <FiTrash2 size={18} style={{ marginRight: '8px' }} />
                                        Limpar
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Card.Body>
                </Card>

                {/* RESULTADOS */}
                <Card className={styles.resultsCard} data-testid="reverse-results-card">
                    <Card.Header className="bg-light border-bottom" style={{ padding: '16px' }}>
                        <h5 style={{ margin: 0 }}>Resultados da Simulação</h5>
                    </Card.Header>
                    <Card.Body>
                        {loading ? (
                            <div className={styles.loadingSpinner} data-testid="reverse-loading">
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Carregando...</span>
                                </Spinner>
                            </div>
                        ) : result ? (
                            <div data-testid="reverse-results">
                                {/* RESULTADO PRINCIPAL EM DESTAQUE */}
                                {result.mode === ReverseSimulationMode.CALCULATE_CONTRIBUTION && result.requiredMonthlyContribution !== null && (
                                    <div className={styles.highlightResult} data-testid="reverse-result-highlight-contribution">
                                        <div className={styles.highlightLabel}>Aporte Mensal Necessário</div>
                                        <div className={styles.highlightValue}>
                                            {currencyFormatter.format(result.requiredMonthlyContribution)}
                                        </div>
                                    </div>
                                )}

                                {result.mode === ReverseSimulationMode.CALCULATE_PERIOD && result.requiredPeriodMonths !== null && (
                                    <div className={styles.highlightResult} data-testid="reverse-result-highlight-period">
                                        <div className={styles.highlightLabel}>Prazo Necessário</div>
                                        <div className={styles.highlightValue}>
                                            {result.requiredPeriodYears !== null
                                                ? `${numberFormatter.format(result.requiredPeriodYears)} anos`
                                                : `${result.requiredPeriodMonths} meses`}
                                        </div>
                                        {result.requiredPeriodYears !== null && (
                                            <div style={{ fontSize: '1rem', color: '#666', marginTop: '4px' }}>
                                                ({result.requiredPeriodMonths} meses)
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* DETALHES */}
                                <div className={styles.resultItem} data-testid="reverse-result-target-amount">
                                    <span className={styles.resultLabel}>Valor Objetivo</span>
                                    <span className={`${styles.resultValue} ${styles.currencyValue}`}>
                                        {currencyFormatter.format(result.targetAmount)}
                                    </span>
                                </div>

                                {result.mode === ReverseSimulationMode.CALCULATE_CONTRIBUTION && (
                                    <div className={styles.resultItem} data-testid="reverse-result-informed-period">
                                        <span className={styles.resultLabel}>Período Informado</span>
                                        <span className={`${styles.resultValue} ${styles.timeValue}`}>
                                            {result.informedPeriod}{' '}
                                            {result.informedPeriodType === 'ANNUAL' ? 'anos' : 'meses'}
                                        </span>
                                    </div>
                                )}

                                {result.mode === ReverseSimulationMode.CALCULATE_PERIOD && result.informedMonthlyContribution !== null && (
                                    <div className={styles.resultItem} data-testid="reverse-result-informed-contribution">
                                        <span className={styles.resultLabel}>Aporte Mensal Informado</span>
                                        <span className={`${styles.resultValue} ${styles.currencyValue}`}>
                                            {currencyFormatter.format(result.informedMonthlyContribution)}
                                        </span>
                                    </div>
                                )}

                                <div className={styles.summarySection}>
                                    <div className={styles.summaryTitle}>Configurações Utilizadas</div>
                                    <div className={styles.resultItem} data-testid="reverse-result-monthly-rate" style={{ paddingTop: 0 }}>
                                        <span className={styles.resultLabel}>Taxa Mensal Equivalente</span>
                                        <span className={styles.resultValue}>
                                            {numberFormatter.format(result.usedMonthlyRatePercent)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.emptyState} data-testid="reverse-empty">
                                <div className={styles.emptyStateIcon}>🎯</div>
                                <div className={styles.emptyStateText}>
                                    {isContribution
                                        ? 'Informe o objetivo e o prazo para calcular o aporte necessário'
                                        : 'Informe o objetivo e o aporte para calcular o prazo necessário'}
                                </div>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
}
