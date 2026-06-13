import { useState } from 'react';
import { Button, Card, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { FiBarChart2, FiPlus, FiRefreshCw, FiTrash2, FiTrendingUp } from 'react-icons/fi';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { errorToast, successToast } from '../components/ui/toast';
import {
    parseLocaleNumber,
} from '../schemas/simulationSchemas';
import {
    scenarioComparisonSchema,
    type ScenarioComparisonFormData,
} from '../schemas/scenarioComparisonSchema';
import { compareScenarios } from '../lib/scenarioComparisonService';
import type { ScenarioComparisonResult } from '../types/scenarioComparison';
import styles from './ScenarioComparisonPage.module.css';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
});

const defaultScenarios = [
    {
        name: 'Conservador',
        initialCapital: '10.000,00',
        monthlyContribution: '500,00',
        interestRate: '0,8',
        months: '24',
    },
    {
        name: 'Agressivo',
        initialCapital: '10.000,00',
        monthlyContribution: '500,00',
        interestRate: '1,2',
        months: '24',
    },
];

export default function ScenarioComparisonPage() {
    const [result, setResult] = useState<ScenarioComparisonResult[] | null>(null);

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ScenarioComparisonFormData>({
        resolver: zodResolver(scenarioComparisonSchema),
        defaultValues: {
            scenarios: defaultScenarios,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'scenarios',
    });

    const onSubmit = async (data: ScenarioComparisonFormData) => {
        try {
            const response = await compareScenarios({
                scenarios: data.scenarios.map((scenario) => ({
                    name: scenario.name,
                    initialCapital: parseLocaleNumber(scenario.initialCapital),
                    monthlyContribution: parseLocaleNumber(scenario.monthlyContribution),
                    interestRate: parseLocaleNumber(scenario.interestRate),
                    months: parseLocaleNumber(scenario.months),
                })),
            });

            setResult(response);
            successToast('Comparação de cenários realizada com sucesso!');
        } catch {
            errorToast('Erro ao comparar cenários. Verifique os dados e tente novamente.');
        }
    };

    const handleClear = () => {
        reset({ scenarios: defaultScenarios });
        setResult(null);
    };

    const handleAddScenario = () => {
        append({
            name: `Cenário ${fields.length + 1}`,
            initialCapital: '',
            monthlyContribution: '',
            interestRate: '',
            months: '',
        });
    };

    const bestScenarioName =
        result && result.length > 0
            ? [...result].sort((a, b) => b.finalAmount - a.finalAmount)[0].scenarioName
            : null;

    return (
        <div className={styles.page}>
            <section className={styles.section}>
                <header className={styles.sectionHeader}>
                    <span className={styles.iconBlock}>
                        <FiBarChart2 size={20} />
                    </span>
                    <h2 className={styles.sectionTitle}>Comparação de Simulações</h2>
                </header>

                <div className={styles.sectionBody}>
                    <Form className={styles.simForm} noValidate onSubmit={handleSubmit(onSubmit)}>
                        <div className={styles.toolbar}>
                            <p className={styles.helperText}>
                                Adicione quantos cenários desejar. A comparação considera todos os
                                cenários informados.
                            </p>
                            <Button className={styles.addButton} type="button" onClick={handleAddScenario}>
                                <FiPlus className="me-2" />
                                Adicionar cenário
                            </Button>
                        </div>

                        {errors.scenarios?.message && (
                            <div className={styles.arrayError}>{errors.scenarios.message}</div>
                        )}

                        <Row className="g-4">
                            {fields.map((field, index) => (
                                <Col lg={6} key={field.id}>
                                    <Card className={styles.scenarioCard}>
                                        <Card.Body>
                                            <div className={styles.scenarioHeader}>
                                                <h3 className={styles.scenarioTitle}>Cenário {index + 1}</h3>
                                                <Button
                                                    className={styles.removeButton}
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    disabled={fields.length <= 2}
                                                >
                                                    <FiTrash2 className="me-2" />
                                                    Remover
                                                </Button>
                                            </div>
                                            <Row className="g-3">
                                                <Col md={12}>
                                                    <Form.Label>Nome</Form.Label>
                                                    <Form.Control
                                                        {...register(`scenarios.${index}.name` as const)}
                                                        isInvalid={!!errors.scenarios?.[index]?.name}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.scenarios?.[index]?.name?.message}
                                                    </Form.Control.Feedback>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Label>Capital Inicial</Form.Label>
                                                    <InputGroup>
                                                        <InputGroup.Text>R$</InputGroup.Text>
                                                        <Form.Control
                                                            {...register(`scenarios.${index}.initialCapital` as const)}
                                                            isInvalid={!!errors.scenarios?.[index]?.initialCapital}
                                                        />
                                                    </InputGroup>
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.scenarios?.[index]?.initialCapital?.message}
                                                    </Form.Control.Feedback>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Label>Aporte Mensal</Form.Label>
                                                    <InputGroup>
                                                        <InputGroup.Text>R$</InputGroup.Text>
                                                        <Form.Control
                                                            {...register(`scenarios.${index}.monthlyContribution` as const)}
                                                            isInvalid={!!errors.scenarios?.[index]?.monthlyContribution}
                                                        />
                                                    </InputGroup>
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.scenarios?.[index]?.monthlyContribution?.message}
                                                    </Form.Control.Feedback>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Label>Taxa de Juros Mensal</Form.Label>
                                                    <InputGroup>
                                                        <InputGroup.Text>%</InputGroup.Text>
                                                        <Form.Control
                                                            {...register(`scenarios.${index}.interestRate` as const)}
                                                            isInvalid={!!errors.scenarios?.[index]?.interestRate}
                                                        />
                                                    </InputGroup>
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.scenarios?.[index]?.interestRate?.message}
                                                    </Form.Control.Feedback>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Label>Meses</Form.Label>
                                                    <Form.Control
                                                        {...register(`scenarios.${index}.months` as const)}
                                                        isInvalid={!!errors.scenarios?.[index]?.months}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.scenarios?.[index]?.months?.message}
                                                    </Form.Control.Feedback>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        <div className={styles.actions}>
                            <Button className={styles.clearButton} type="button" onClick={handleClear} disabled={isSubmitting}>
                                Limpar <FiRefreshCw className="ms-2" />
                            </Button>
                            <Button className={styles.calculateButton} type="submit" disabled={isSubmitting}>
                                Comparar
                            </Button>
                        </div>
                    </Form>
                </div>
            </section>

            {result && (
                <section className={styles.section}>
                    <header className={styles.sectionHeader}>
                        <span className={styles.iconBlock}>
                            <FiTrendingUp size={20} />
                        </span>
                        <h2 className={styles.sectionTitle}>Resultado da Comparação</h2>
                    </header>

                    <div className={styles.sectionBody}>
                        {bestScenarioName && (
                            <div className={styles.bestInfo}>
                                Melhor cenário: <strong>{bestScenarioName}</strong>
                            </div>
                        )}

                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Cenário</th>
                                        <th>Total Investido</th>
                                        <th>Total em Juros</th>
                                        <th>Montante Final</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.map((item, index) => (
                                        <tr key={`${item.scenarioName}-${index}`} className={item.scenarioName === bestScenarioName ? styles.bestRow : ''}>
                                            <td>{item.scenarioName}</td>
                                            <td>{currencyFormatter.format(item.investedAmount)}</td>
                                            <td>{currencyFormatter.format(item.totalInterest)}</td>
                                            <td>{currencyFormatter.format(item.finalAmount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
