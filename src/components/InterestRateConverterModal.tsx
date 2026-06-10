import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FiRefreshCw, FiCopy, FiCheck } from 'react-icons/fi';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { rateConversionSchema, type RateConversionFormData } from '../schemas/interestRateConverterSchema';
import {
    convertInterestRate,
    formatRateForDisplay,
    getOptimalDecimalPlaces,
} from '../utils/interestRateConverter';
import type { RateConversionResult, RateConverterModalProps } from '../types/interestRateConverter';
import { successToast } from './ui/toast';
import s from './InterestRateConverterModal.module.css';
import '../styles/modal.css';

export default function InterestRateConverterModal({ show, onClose, onApply }: RateConverterModalProps) {
    const [result, setResult] = useState<RateConversionResult | null>(null);
    const [copied, setCopied] = useState(false);

    const roundToTwoDecimals = (value: number) => Number(value.toFixed(2));

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<RateConversionFormData>({
        resolver: zodResolver(rateConversionSchema),
        defaultValues: {
            rate: undefined,
            direction: 'TO_MONTHLY',
        },
    });

    const direction = watch('direction');
    const rateValue = watch('rate');

    // Cálculo em tempo real conforme o usuário digita
    useEffect(() => {
        if (rateValue === undefined || rateValue === null || isNaN(rateValue)) {
            setResult(null);
            return;
        }

        try {
            const conversion = convertInterestRate({ rate: rateValue, direction });
            setResult(conversion);
        } catch {
            setResult(null);
        }
    }, [rateValue, direction]);

    const onSubmit: SubmitHandler<RateConversionFormData> = (data) => {
        const conversion = convertInterestRate({ rate: data.rate, direction: data.direction });
        setResult(conversion);
    };

    const handleCopy = async () => {
        if (!result) return;

        const formatted = roundToTwoDecimals(result.convertedRate).toFixed(2).replace('.', ',');

        await navigator.clipboard.writeText(formatted);
        setCopied(true);
        successToast('Taxa copiada para a área de transferência!');

        setTimeout(() => setCopied(false), 2000);
    };

    const handleApply = () => {
        if (!result || !onApply) return;
        onApply(roundToTwoDecimals(result.convertedRate), result.convertedType);
        onClose();
    };

    const handleClose = () => {
        reset({ rate: undefined, direction: 'TO_MONTHLY' });
        setResult(null);
        setCopied(false);
        onClose();
    };

    const originLabel = direction === 'TO_MONTHLY' ? 'Taxa Anual (% a.a.)' : 'Taxa Mensal (% a.m.)';
    const targetLabel = direction === 'TO_MONTHLY' ? 'Taxa Mensal Equivalente' : 'Taxa Anual Equivalente';
    const targetSuffix = direction === 'TO_MONTHLY' ? 'a.m.' : 'a.a.';

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title className={s.title}>
                    <FiRefreshCw size={20} />
                    Conversor de Taxa de Juros
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                    {/* Seleção de direção */}
                    <Form.Group className="mb-3">
                        <Form.Label>Converter</Form.Label>
                        <div className={s.directionGroup}>
                            <button
                                type="button"
                                className={`btn ${s.directionButton} ${direction === 'TO_MONTHLY' ? s.directionButtonActive : ''}`}
                                onClick={() => reset({ rate: rateValue, direction: 'TO_MONTHLY' })}
                            >
                                Anual → Mensal
                            </button>
                            <button
                                type="button"
                                className={`btn ${s.directionButton} ${direction === 'TO_YEARLY' ? s.directionButtonActive : ''}`}
                                onClick={() => reset({ rate: rateValue, direction: 'TO_YEARLY' })}
                            >
                                Mensal → Anual
                            </button>
                        </div>
                    </Form.Group>

                    {/* Input de taxa */}
                    <Form.Group className="mb-3">
                        <Form.Label>{originLabel}</Form.Label>
                        <Form.Control
                            type="number"
                            step="any"
                            min="0"
                            max="1000"
                            placeholder="Ex: 12"
                            isInvalid={!!errors.rate}
                            {...register('rate', { valueAsNumber: true })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.rate?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Form>

                {/* Resultado */}
                {result && (
                    <div className={s.resultCard}>
                        <div className={s.conversionArrow}>
                            <span>
                                {direction === 'TO_MONTHLY' ? '% a.a.' : '% a.m.'}
                            </span>
                            →
                            <span>
                                {direction === 'TO_MONTHLY' ? '% a.m.' : '% a.a.'}
                            </span>
                        </div>

                        <div className={s.resultLabel}>{targetLabel}</div>
                        <div className={s.resultValue}>
                            {formatRateForDisplay(
                                result.convertedRate,
                                getOptimalDecimalPlaces(result.convertedRate)
                            )}%
                            <small style={{ fontSize: '0.9rem', fontWeight: 500, marginLeft: 6, color: 'var(--text-muted)' }}>
                                {targetSuffix}
                            </small>
                        </div>

                        <div className={s.resultFormula}>{result.formula}</div>

                        <Button
                            variant="outline-primary"
                            className={`${s.copyButton} ${copied ? s.copyButtonSuccess : ''}`}
                            onClick={handleCopy}
                        >
                            {copied ? <FiCheck size={15} /> : <FiCopy size={15} />}
                            {copied ? 'Copiado!' : 'Copiar taxa'}
                        </Button>

                        {onApply && (
                            <Button
                                variant="success"
                                className={`${s.copyButton} mt-2`}
                                onClick={handleApply}
                                style={{ color: '#fff' }}
                            >
                                Usar na simulação
                            </Button>
                        )}
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer>
                <div className={s.footer}>
                    <Button
                        variant="outline-secondary"
                        className={s.closeButton}
                        onClick={handleClose}
                    >
                        Fechar
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
}
