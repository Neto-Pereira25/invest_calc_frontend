import { useState, type FormEvent } from 'react';
import { simulate } from '../lib/compoundInterestSimulationService';
import type { SimulationResponse } from '../types/compoundInterestSimulation';
import { Button, Card, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { FiBarChart2, FiDollarSign, FiList, FiTrash2 } from 'react-icons/fi';
import CompoundInterestSimulationChart from '../components/CompoundInterestSimulationChart';
import CompoundInterestSimulationTable from '../components/CompoundInterestSimulationTable';
import styles from './CompoundInterestSimulationPage.module.css';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
});

function parseLocaleNumber(value: string): number {
    const sanitized = value
        .trim()
        .replace(/[^\d,.-]/g, '')
        .replace(/(?!^)-/g, '');

    if (!sanitized) {
        return 0;
    }

    const signal = sanitized.startsWith('-') ? -1 : 1;
    const unsigned = sanitized.replace('-', '');

    const lastComma = unsigned.lastIndexOf(',');
    const lastDot = unsigned.lastIndexOf('.');
    const decimalIndex = Math.max(lastComma, lastDot);

    let normalized: string;

    if (decimalIndex === -1) {
        normalized = unsigned.replace(/[.,]/g, '');
    } else {
        const integerPart = unsigned.slice(0, decimalIndex).replace(/[.,]/g, '');
        const fractionPart = unsigned.slice(decimalIndex + 1).replace(/[.,]/g, '');
        const hasMixedSeparators = lastComma !== -1 && lastDot !== -1;
        const shouldTreatAsThousands = !hasMixedSeparators && fractionPart.length === 3;

        normalized = shouldTreatAsThousands
            ? `${integerPart}${fractionPart}`
            : `${integerPart || '0'}.${fractionPart || '0'}`;
    }

    const parsed = signal * Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
}

export default function CompoundInterestSimulationPage() {
    const [form, setForm] = useState({
        initialValue: '',
        monthlyContribution: '',
        interestRate: '',
        period: '',
        rateType: 'YEARLY',
        periodType: 'ANNUAL',
    });

    const [result, setResult] = useState<SimulationResponse | null>(null);

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();


        const data = await simulate({
            initialValue: parseLocaleNumber(form.initialValue),
            monthlyContribution: parseLocaleNumber(form.monthlyContribution),
            interestRate: parseLocaleNumber(form.interestRate),
            period: parseLocaleNumber(form.period),
            periodType: form.periodType as 'ANNUAL' | 'MONTHLY',
            rateType: form.rateType as 'YEARLY' | 'MONTHLY',
        });

        setResult(data);
    };

    const handleClear = () => {
        setForm({
            initialValue: '',
            monthlyContribution: '',
            interestRate: '',
            period: '',
            rateType: 'YEARLY',
            periodType: 'ANNUAL',
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
                    <Form className={styles.simForm} onSubmit={handleSubmit}>
                        <Row className="g-4">
                            <Col md={6}>
                                <Form.Label>Valor Inicial</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>R$</InputGroup.Text>
                                    <Form.Control
                                        placeholder="20.000,00"
                                        value={form.initialValue}
                                        onChange={(e) => handleChange('initialValue', e.target.value)}
                                    />
                                </InputGroup>
                            </Col>

                            <Col md={6}>
                                <Form.Label>Taxa de Juros</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>%</InputGroup.Text>
                                    <Form.Control
                                        placeholder="14,50"
                                        value={form.interestRate}
                                        onChange={(e) => handleChange('interestRate', e.target.value)}
                                    />
                                    <Form.Select
                                        value={form.rateType}
                                        onChange={(e) => handleChange('rateType', e.target.value)}
                                    >
                                        <option value='YEARLY'>ANUAL</option>
                                        <option value='MONTHLY'>MENSAL</option>
                                    </Form.Select>
                                </InputGroup>
                            </Col>

                            <Col md={6}>
                                <Form.Label>Período</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        placeholder="1"
                                        value={form.period}
                                        onChange={(e) => handleChange('period', e.target.value)}
                                    />
                                    <Form.Select
                                        value={form.periodType}
                                        onChange={(e) => handleChange('periodType', e.target.value)}
                                    >
                                        <option value='ANNUAL'>ANOS</option>
                                        <option value='MONTHLY'>MESES</option>
                                    </Form.Select>
                                </InputGroup>
                            </Col>

                            <Col md={6}>
                                <Form.Label>Investimento Mensal</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>R$</InputGroup.Text>
                                    <Form.Control
                                        placeholder="1.000,00"
                                        value={form.monthlyContribution}
                                        onChange={(e) => handleChange('monthlyContribution', e.target.value)}
                                    />
                                </InputGroup>
                            </Col>
                        </Row>

                        <div className={styles.actions}>
                            <Button className={styles.clearButton} type="button" onClick={handleClear}>
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