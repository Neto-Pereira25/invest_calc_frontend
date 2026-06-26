import { useState } from 'react';
import { Button, Card, Form, InputGroup, Spinner } from 'react-bootstrap';
import { FiBarChart2, FiDollarSign, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import styles from './RetirementSimulationPage.module.css';
import { retirementSimulatorService } from '../lib/retirementSimulatorService';
import type {
  RetirementSimulatorRequest,
  RetirementSimulatorResponse,
} from '../types/retirementSimulator';
import {
  RateInputType,
  RateType,
  PeriodType,
} from '../types/retirementSimulator';
import InterestRateConverterModal from '../components/InterestRateConverterModal';
import { errorToast, successToast } from '../components/ui/toast';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const parseLocaleNumber = (value: string): number => {
  if (value.includes(',')) {
    // Formato pt-BR: ponto é separador de milhar, vírgula é decimal
    // Ex: "1.296,90" → "1296.90"
    return parseFloat(value.replace(/\./g, '').replace(',', '.'));
  }
  // Sem vírgula: ponto é separador decimal (ex: "8.5" → 8.5)
  return parseFloat(value);
};

const retirementSimulationSchema = z.object({
  desiredMonthlyIncome: z
    .string()
    .min(1, 'Renda mensal desejada é obrigatória')
    .refine(
      (val) => !isNaN(parseLocaleNumber(val)),
      'Renda mensal deve ser um número válido'
    ),
  interestRate: z
    .string()
    .min(1, 'Taxa de juros é obrigatória')
    .refine(
      (val) => !isNaN(parseLocaleNumber(val)),
      'Taxa de juros deve ser um número válido'
    ),
  period: z
    .string()
    .min(1, 'Período é obrigatório')
    .refine((val) => !isNaN(parseInt(val)), 'Período deve ser um número válido'),
  periodType: z.enum([PeriodType.ANNUAL, PeriodType.MONTHLY]),
  rateType: z.enum([RateType.YEARLY, RateType.MONTHLY]),
  annualInflationRate: z
    .string()
    .refine(
      (val) => val === '' || !isNaN(parseLocaleNumber(val)),
      'Inflação anual deve ser um número válido'
    )
    .optional(),
  safeWithdrawalRate: z
    .string()
    .refine(
      (val) => val === '' || !isNaN(parseLocaleNumber(val)),
      'Taxa de retirada segura deve ser um número válido'
    )
    .optional(),
});

type RetirementFormData = z.infer<typeof retirementSimulationSchema>;

export default function RetirementSimulationPage() {
  const [result, setResult] = useState<RetirementSimulatorResponse | null>(null);
  const [showRateConverter, setShowRateConverter] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RetirementFormData>({
    resolver: zodResolver(retirementSimulationSchema),
    defaultValues: {
      desiredMonthlyIncome: '',
      interestRate: '',
      period: '',
      periodType: PeriodType.ANNUAL,
      rateType: RateType.YEARLY,
      annualInflationRate: '',
      safeWithdrawalRate: '',
    },
  });

  const onSubmit = async (formData: RetirementFormData) => {
    try {
      setLoading(true);

      const request: RetirementSimulatorRequest = {
        desiredMonthlyIncome: parseLocaleNumber(formData.desiredMonthlyIncome),
        interestRate: parseLocaleNumber(formData.interestRate),
        period: parseInt(formData.period),
        periodType: formData.periodType,
        rateType: formData.rateType,
        interestRateInputType: RateInputType.PERCENTAGE,
        annualInflationRate: formData.annualInflationRate
          ? parseLocaleNumber(formData.annualInflationRate)
          : undefined,
        safeWithdrawalRate: formData.safeWithdrawalRate
          ? parseLocaleNumber(formData.safeWithdrawalRate)
          : undefined,
      };

      console.log('request:', request);

      const data = await retirementSimulatorService.simulate(request);
      setResult(data);
      successToast('Simulação realizada com sucesso!');
      console.log('response:', data);
    } catch {
      errorToast(
        'Ocorreu um erro ao realizar a simulação. Por favor, tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    reset({
      desiredMonthlyIncome: '',
      interestRate: '',
      period: '',
      periodType: PeriodType.ANNUAL,
      rateType: RateType.YEARLY,
      annualInflationRate: '',
      safeWithdrawalRate: '',
    });
    setResult(null);
  };

  return (
    <div className={styles.container} data-testid="retirement-simulation-page">
      <InterestRateConverterModal
        show={showRateConverter}
        onClose={() => setShowRateConverter(false)}
        onApply={(rate, rateType) => {
          setValue('interestRate', String(rate).replace('.', ','));
          setValue('rateType', rateType === 'MONTHLY' ? 'MONTHLY' : 'YEARLY');
          setShowRateConverter(false);
        }}
      />

      <div className={styles.title}>
        <FiDollarSign size={32} style={{ marginRight: '12px' }} />
        Simulador de Aposentadoria
      </div>
      <div className={styles.subtitle}>
        Calcule quanto você precisa economizar mensalmente para alcançar a renda desejada na
        aposentadoria
      </div>

      <div className={styles.content}>
        {/* FORMULÁRIO */}
        <Card className={styles.formCard}>
          <Card.Header className="bg-light border-bottom" style={{ padding: '16px' }}>
            <h5 style={{ margin: 0 }}>Parâmetros da Simulação</h5>
          </Card.Header>
          <Card.Body>
            <Form noValidate onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.rowGroup}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Renda Mensal Desejada *</label>
                  <InputGroup>
                    <InputGroup.Text>R$</InputGroup.Text>
                    <Form.Control
                      placeholder="3.000,00"
                      data-testid="retirement-desired-income"
                      {...register('desiredMonthlyIncome')}
                      isInvalid={!!errors.desiredMonthlyIncome}
                    />
                  </InputGroup>
                  {errors.desiredMonthlyIncome && (
                    <div className={styles.helpText} style={{ color: '#dc3545' }}>
                      {errors.desiredMonthlyIncome.message}
                    </div>
                  )}
                  <div className={styles.helpText}>
                    Valor que você deseja receber mensalmente na aposentadoria
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Taxa de Juros *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <InputGroup style={{ flex: 1 }}>
                      <InputGroup.Text>%</InputGroup.Text>
                      <Form.Control
                        placeholder="8,50"
                        data-testid="retirement-interest-rate"
                        {...register('interestRate')}
                        isInvalid={!!errors.interestRate}
                      />
                      <Form.Select
                        data-testid="retirement-rate-type"
                        {...register('rateType')}
                        isInvalid={!!errors.rateType}
                        style={{ maxWidth: '140px' }}
                      >
                        <option value={RateType.YEARLY}>Anual</option>
                        <option value={RateType.MONTHLY}>Mensal</option>
                      </Form.Select>
                    </InputGroup>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      data-testid="retirement-rate-converter"
                      onClick={() => setShowRateConverter(true)}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      <FiRefreshCw size={16} />
                    </Button>
                  </div>
                  {errors.interestRate && (
                    <div className={styles.helpText} style={{ color: '#dc3545' }}>
                      {errors.interestRate.message}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.rowGroup}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Período até Aposentadoria *</label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      placeholder="30"
                      data-testid="retirement-period"
                      {...register('period')}
                      isInvalid={!!errors.period}
                    />
                    <Form.Select
                      data-testid="retirement-period-type"
                      {...register('periodType')}
                      isInvalid={!!errors.periodType}
                      style={{ maxWidth: '140px' }}
                    >
                      <option value={PeriodType.ANNUAL}>Anos</option>
                      <option value={PeriodType.MONTHLY}>Meses</option>
                    </Form.Select>
                  </InputGroup>
                  {errors.period && (
                    <div className={styles.helpText} style={{ color: '#dc3545' }}>
                      {errors.period.message}
                    </div>
                  )}
                  <div className={styles.helpText}>
                    Quantos anos ou meses até você se aposentar
                  </div>
                </div>
              </div>

              {/* OPÇÕES AVANÇADAS */}
              <div className={styles.advancedOptions}>
                <div className={styles.advancedTitle}>Opções Avançadas (Opcional)</div>

                <div className={styles.rowGroup}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Taxa de Inflação Anual</label>
                    <InputGroup>
                      <InputGroup.Text>%</InputGroup.Text>
                      <Form.Control
                        placeholder="2,50"
                        data-testid="retirement-annual-inflation"
                        {...register('annualInflationRate')}
                        isInvalid={!!errors.annualInflationRate}
                      />
                    </InputGroup>
                    {errors.annualInflationRate && (
                      <div className={styles.helpText} style={{ color: '#dc3545' }}>
                        {errors.annualInflationRate.message}
                      </div>
                    )}
                    <div className={styles.helpText}>
                      Padrão: 0% (deixe em branco para usar o padrão)
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Taxa de Retirada Segura</label>
                    <InputGroup>
                      <InputGroup.Text>%</InputGroup.Text>
                      <Form.Control
                        placeholder="4,00"
                        data-testid="retirement-safe-withdrawal"
                        {...register('safeWithdrawalRate')}
                        isInvalid={!!errors.safeWithdrawalRate}
                      />
                    </InputGroup>
                    {errors.safeWithdrawalRate && (
                      <div className={styles.helpText} style={{ color: '#dc3545' }}>
                        {errors.safeWithdrawalRate.message}
                      </div>
                    )}
                    <div className={styles.helpText}>
                      Padrão: 4% (deixe em branco para usar o padrão)
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.buttonGroup}>
                <Button
                  variant="primary"
                  type="submit"
                  data-testid="retirement-submit"
                  disabled={isSubmitting || loading}
                  style={{ fontSize: '1rem' }}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        style={{ marginRight: '8px' }}
                      />
                      Simulando...
                    </>
                  ) : (
                    <>
                      <FiBarChart2 size={18} style={{ marginRight: '8px' }} />
                      Simular
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  data-testid="retirement-clear"
                  onClick={handleClear}
                  disabled={isSubmitting || loading}
                  style={{ fontSize: '1rem' }}
                >
                  <FiTrash2 size={18} style={{ marginRight: '8px' }} />
                  Limpar
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        {/* RESULTADOS */}
        <Card className={styles.resultsCard} data-testid="retirement-results-card">
          <Card.Header className="bg-light border-bottom" style={{ padding: '16px' }}>
            <h5 style={{ margin: 0 }}>Resultados da Simulação</h5>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <div className={styles.loadingSpinner} data-testid="retirement-loading">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </Spinner>
              </div>
            ) : result ? (
              <div data-testid="retirement-results">
                <div className={styles.resultItem} data-testid="retirement-result-income">
                  <span className={styles.resultLabel}>Renda Desejada</span>
                  <span className={`${styles.resultValue} ${styles.currencyValue}`}>
                    {currencyFormatter.format(result.desiredMonthlyIncome)}
                  </span>
                </div>

                <div className={styles.resultItem} data-testid="retirement-result-inflation-income">
                  <span className={styles.resultLabel}>Renda Ajustada por Inflação</span>
                  <span className={`${styles.resultValue} ${styles.currencyValue}`}>
                    {currencyFormatter.format(result.inflationAdjustedMonthlyIncome)}
                  </span>
                </div>

                <div className={styles.resultItem} data-testid="retirement-result-target-amount">
                  <span className={styles.resultLabel}>Valor Alvo para Aposentadoria</span>
                  <span className={`${styles.resultValue} ${styles.currencyValue}`}>
                    {currencyFormatter.format(result.targetAmount)}
                  </span>
                </div>

                <div className={styles.resultItem} data-testid="retirement-result-monthly-contribution">
                  <span className={styles.resultLabel}>Aporte Mensal Necessário</span>
                  <span className={`${styles.resultValue} ${styles.currencyValue}`}>
                    {currencyFormatter.format(result.requiredMonthlyContribution)}
                  </span>
                </div>

                <div className={styles.resultItem} data-testid="retirement-result-months">
                  <span className={styles.resultLabel}>Período até Aposentadoria</span>
                  <span className={`${styles.resultValue} ${styles.timeValue}`}>
                    {result.monthsToRetirement} meses
                  </span>
                </div>

                <div className={styles.summarySection}>
                  <div className={styles.summaryTitle}>Configurações Utilizadas</div>
                  <div className={styles.summaryGrid}>
                    <div className={styles.summaryItem} data-testid="retirement-result-used-inflation">
                      <div className={styles.summaryItemLabel}>Taxa de Inflação Anual</div>
                      <div className={styles.summaryItemValue}>
                        {numberFormatter.format(result.usedAnnualInflationRate)}%
                      </div>
                    </div>
                    <div className={styles.summaryItem} data-testid="retirement-result-used-withdrawal">
                      <div className={styles.summaryItemLabel}>Taxa de Retirada Segura</div>
                      <div className={styles.summaryItemValue}>
                        {numberFormatter.format(result.usedSafeWithdrawalRate)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.emptyState} data-testid="retirement-empty">
                <div className={styles.emptyStateIcon}>📊</div>
                <div className={styles.emptyStateText}>
                  Preencha os parâmetros e clique em "Simular" para ver os resultados
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
