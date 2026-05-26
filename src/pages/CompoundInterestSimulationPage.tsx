import { useState } from 'react';
import { simulate } from '../lib/compoundInterestSimulationService';
import type { SimulationResponse } from '../types/compoundInterestSimulation';
import { Button, Card, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { FiBarChart2, FiDollarSign, FiList, FiTrash2 } from 'react-icons/fi';
import CompoundInterestSimulationChart from '../components/CompoundInterestSimulationChart';
import CompoundInterestSimulationTable from '../components/CompoundInterestSimulationTable';
import styles from './CompoundInterestSimulationPage.module.css';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { parseLocaleNumber, simulationSchema, type SimulationFormData } from '../schemas/simulationSchemas';
import { errorToast, successToast } from '../components/ui/toast';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
});

export default function CompoundInterestSimulationPage() {
    const [result, setResult] = useState<SimulationResponse | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<SimulationFormData>({
        resolver: zodResolver(simulationSchema),
        defaultValues: {
            initialValue: '',
            monthlyContribution: '',
            interestRate: '',
            period: '',
            periodType: 'ANNUAL',
            rateType: 'YEARLY',
        },
    });

    const onSubmit = async (formData: SimulationFormData) => {
        try {
            const data = await simulate({
                initialValue: parseLocaleNumber(formData.initialValue),
                monthlyContribution: parseLocaleNumber(formData.monthlyContribution),
                interestRate: parseLocaleNumber(formData.interestRate),
                period: parseLocaleNumber(formData.period),
                periodType: formData.periodType,
                rateType: formData.rateType,
            });


            setResult(data);
            successToast('Simulação realizada com sucesso!');
        } catch {
            errorToast('Ocorreu um erro ao realizar a simulação. Por favor, tente novamente.');
        }
    };

    const handleClear = () => {
        reset({
            initialValue: '',
            monthlyContribution: '',
            interestRate: '',
            period: '',
            periodType: 'ANNUAL',
            rateType: 'YEARLY',
        });
        setResult(null);
    };

    return (
        <div className={styles.page}>
            <section className={styles.section}>
                <header className={styles.sectionHeader}>
                    <span className={styles.iconBlock}>
                        <FiDollarSign size={20} />
                    </span>
                    <h2 className={styles.sectionTitle}>Simulador de Juros Compostos</h2>
                </header>

                <div className={styles.sectionBody}>
                    <Form className={styles.simForm} noValidate onSubmit={handleSubmit(onSubmit)}>
                        <Row className="g-4">
                            <Col md={6}>
                                <Form.Label>Valor Inicial</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>R$</InputGroup.Text>
                                    <Form.Control
                                        data-testid="simulation-initial-value"
                                        placeholder="20.000,00"
                                        {...register('initialValue')}
                                        isInvalid={!!errors.initialValue}
                                    />
                                </InputGroup>
                                <Form.Control.Feedback type="invalid">
                                    {errors.initialValue?.message}
                                </Form.Control.Feedback>
                            </Col>

                            <Col md={6}>
                                <Form.Label>Taxa de Juros</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>%</InputGroup.Text>
                                    <Form.Control
                                        data-testid="simulation-interest-rate"
                                        placeholder="14,50"
                                        {...register('interestRate')}
                                        isInvalid={!!errors.interestRate}
                                    />
                                    <Form.Select
                                        data-testid="simulation-rate-type"
                                        {...register('rateType')}
                                        isInvalid={!!errors.rateType}
                                    >
                                        <option value='YEARLY'>ANUAL</option>
                                        <option value='MONTHLY'>MENSAL</option>
                                    </Form.Select>
                                </InputGroup>
                                <Form.Control.Feedback type="invalid">
                                    {errors.interestRate?.message}
                                </Form.Control.Feedback>
                            </Col>

                            <Col md={6}>
                                <Form.Label>Período</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        data-testid="simulation-period"
                                        placeholder="1"
                                        {...register('period')}
                                        isInvalid={!!errors.period}
                                    />
                                    <Form.Select
                                        data-testid="simulation-period-type"
                                        {...register('periodType')}
                                    >
                                        <option value='ANNUAL'>ANOS</option>
                                        <option value='MONTHLY'>MESES</option>
                                    </Form.Select>
                                </InputGroup>
                                <Form.Control.Feedback type="invalid">
                                    {errors.period?.message}
                                </Form.Control.Feedback>
                            </Col>

                            <Col md={6}>
                                <Form.Label>Investimento Mensal</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>R$</InputGroup.Text>
                                    <Form.Control
                                        data-testid="simulation-monthly-contribution"
                                        placeholder="1.000,00"
                                        {...register('monthlyContribution')}
                                        isInvalid={!!errors.monthlyContribution}
                                    />
                                </InputGroup>
                                <Form.Control.Feedback type="invalid">
                                    {errors.monthlyContribution?.message}
                                </Form.Control.Feedback>
                            </Col>
                        </Row>

                        <div className={styles.actions}>
                            <Button className={styles.clearButton} type="button" onClick={handleClear} disabled={isSubmitting}>
                                Limpar <FiTrash2 className="ms-2" />
                            </Button>
                            <Button className={styles.calculateButton} type="submit">
                                Calcular
                            </Button>
                        </div>
                    </Form>
                </div>
            </section>

            {result && (
                <section className={styles.section}>
                    <header className={styles.sectionHeader}>
                        <span className={styles.iconBlock}>
                            <FiList size={20} />
                        </span>
                        <h2 className={styles.sectionTitle}>Resultado</h2>
                    </header>

                    <div className={styles.sectionBody}>
                        <Row className="g-4">
                            <Col md={4}>
                                <Card className={styles.resultCard}>
                                    <p className={styles.resultLabel}>Total em Juros</p>
                                    <h3 className={`${styles.resultValue} ${styles.highlight}`}>
                                        {currencyFormatter.format(result.totalInterest)}
                                    </h3>
                                </Card>
                            </Col>

                            <Col md={4}>
                                <Card className={styles.resultCard}>
                                    <p className={styles.resultLabel}>Valor Total Investido</p>
                                    <h3 className={styles.resultValue}>
                                        {currencyFormatter.format(result.totalInvested)}
                                    </h3>
                                </Card>
                            </Col>

                            <Col md={4}>
                                <Card className={styles.resultCard}>
                                    <p className={styles.resultLabel}>Valor Total Final</p>
                                    <h3 className={styles.resultValue}>
                                        {currencyFormatter.format(result.finalAmount)}
                                    </h3>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </section>
            )}

            {result && (
                <section className={styles.section}>
                    <header className={styles.sectionHeader}>
                        <span className={styles.iconBlock}>
                            <FiBarChart2 size={20} />
                        </span>
                        <h2 className={styles.sectionTitle}>Gráfico</h2>
                    </header>

                    <div className={styles.sectionBody}>
                        <CompoundInterestSimulationChart
                            data={result.monthlyBreakdown}
                            totalInterest={result.totalInterest}
                            totalInvested={result.totalInvested}
                        />
                    </div>
                </section>
            )}

            {result && (
                <section className={styles.section}>
                    <header className={styles.sectionHeader}>
                        <span className={styles.iconBlock}>
                            <FiList size={20} />
                        </span>
                        <h2 className={styles.sectionTitle}>Tabela</h2>
                    </header>

                    <div className={styles.sectionBody}>
                        <CompoundInterestSimulationTable data={result.monthlyBreakdown} />
                    </div>
                </section>
            )}
        </div>
    );
}