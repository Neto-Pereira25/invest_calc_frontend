import { useState } from 'react';
import { simulate } from '../lib/compoundInterestSimulationService';
import type { SimulationResponse } from '../types/compoundInterestSimulation';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import CompoundInterestSimulationChart from '../components/CompoundInterestSimulationChart';
import CompoundInterestSimulationTable from '../components/CompoundInterestSimulationTable';


export default function CompoundInterestSimulationPage() {
    const [form, setForm] = useState({
        initialValue: '',
        monthlyContribution: '',
        interestRate: '',
        period: '',
    });

    const [result, setResult] = useState<SimulationResponse | null>(null);

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        const data = await simulate({
            initialValue: Number(form.initialValue),
            monthlyContribution: Number(form.monthlyContribution),
            interestRate: Number(form.interestRate),
            period: Number(form.period),
            periodType: 'ANNUAL',
            rateType: 'YEARLY',
        });

        setResult(data);
    };


    return (
        <div>
            <h1>Simulador de Juros Compostos</h1>

            {/* FORM */}
            <Card bg="dark" text="light" className="p-4 mt-3">
                <Form>
                    <Row>
                        <Col>
                            <Form.Label>Capital Inicial</Form.Label>
                            <Form.Control
                                value={form.initialValue}
                                onChange={(e) => handleChange('initialValue', e.target.value)}
                            />
                        </Col>

                        <Col>
                            <Form.Label>Aporte Mensal</Form.Label>
                            <Form.Control
                                value={form.monthlyContribution}
                                onChange={(e) => handleChange('monthlyContribution', e.target.value)}
                            />
                        </Col>
                    </Row>

                    <Row className="mt-3">
                        <Col>
                            <Form.Label>Taxa (% ao ano)</Form.Label>
                            <Form.Control
                                value={form.interestRate}
                                onChange={(e) => handleChange('interestRate', e.target.value)}
                            />
                        </Col>

                        <Col>
                            <Form.Label>Período (anos)</Form.Label>
                            <Form.Control
                                value={form.period}
                                onChange={(e) => handleChange('period', e.target.value)}
                            />
                        </Col>
                    </Row>

                    <Button className="mt-4 w-100" variant="success" onClick={handleSubmit}>
                        Simular
                    </Button>
                </Form>
            </Card>

            {/* RESULTADO */}
            {result && (
                <>
                    <Row className="mt-4">
                        <Col>
                            <Card bg="dark" text="light" className="p-3">
                                <h5>Total Investido</h5>
                                <h3>R$ {result.totalInvested.toFixed(2)}</h3>
                            </Card>
                        </Col>

                        <Col>
                            <Card bg="dark" text="light" className="p-3">
                                <h5>Juros</h5>
                                <h3 style={{ color: 'var(--primary)' }}>
                                    R$ {result.totalInterest.toFixed(2)}
                                </h3>
                            </Card>
                        </Col>

                        <Col>
                            <Card bg="dark" text="light" className="p-3">
                                <h5>Montante Final</h5>
                                <h3 style={{ color: '#00ff9d' }}>
                                    R$ {result.finalAmount.toFixed(2)}
                                </h3>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}

            <Card bg='dark' text='light' className='p-4 mt-4'>
                <h5>Evolução do Investimento</h5>
                <CompoundInterestSimulationChart data={result?.monthlyBreakdown || []} />
            </Card>

            {result && (
                <Card bg="dark" text="light" className="p-4 mt-4">
                    <h5>Evolução mês a mês</h5>

                    <CompoundInterestSimulationTable data={result.monthlyBreakdown} />
                </Card>
            )}
        </div>
    );
}