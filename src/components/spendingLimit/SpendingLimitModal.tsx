import { useEffect } from 'react';

import {
    Modal,
    Button,
    Form,
    Spinner
} from 'react-bootstrap';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import {
    spendingLimitSchema,
    type SpendingLimitFormData
} from '../../schemas/spendingLimitSchema';

import type { SpendingLimit } from '../../types/spendingLimit';

import { useSpendingLimitStore } from '../../store/spendingLimitStore';

interface SpendingLimitModalProps {
    show: boolean;

    handleClose: () => void;

    mode: 'create' | 'edit';

    spendingLimit?: SpendingLimit | null;
}

export function SpendingLimitModal({
    show,
    handleClose,
    mode,
    spendingLimit
}: SpendingLimitModalProps) {

    const createSpendingLimit =
        useSpendingLimitStore(
            (state) =>
                state.createSpendingLimit
        );

    const updateSpendingLimit =
        useSpendingLimitStore(
            (state) =>
                state.updateSpendingLimit
        );

    const {
        register,
        handleSubmit,
        reset,
        formState: {
            errors,
            isSubmitting
        }
    } = useForm<SpendingLimitFormData>({
        resolver:
            zodResolver(
                spendingLimitSchema
            )
    });

    useEffect(() => {

        if (
            mode === 'edit' &&
            spendingLimit
        ) {

            reset({
                amount:
                    spendingLimit.amount
            });

            return;
        }

        reset({
            amount: 0
        });

    }, [
        mode,
        spendingLimit,
        reset
    ]);

    async function onSubmit(
        data: SpendingLimitFormData
    ) {

        try {

            if (
                mode === 'edit'
            ) {

                await updateSpendingLimit(
                    data
                );

            } else {

                await createSpendingLimit(
                    data
                );
            }

            handleClose();

        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    {mode === 'create'
                        ? 'Definir Limite Mensal'
                        : 'Editar Limite Mensal'}
                </Modal.Title>
            </Modal.Header>

            <Form
                onSubmit={
                    handleSubmit(
                        onSubmit
                    )
                }
            >
                <Modal.Body>

                    <Form.Group>
                        <Form.Label>
                            Limite Mensal
                        </Form.Label>

                        <Form.Control
                            type="number"
                            step="0.01"
                            placeholder="Ex: 2500"
                            {
                            ...register(
                                'amount',
                                {
                                    valueAsNumber:
                                        true
                                }
                            )
                            }
                            isInvalid={
                                !!errors.amount
                            }
                        />

                        <Form.Control.Feedback
                            type="invalid"
                        >
                            {
                                errors.amount
                                    ?.message
                            }
                        </Form.Control.Feedback>

                    </Form.Group>

                </Modal.Body>

                <Modal.Footer>

                    <Button
                        variant="secondary"
                        onClick={
                            handleClose
                        }
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="submit"
                        disabled={
                            isSubmitting
                        }
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner
                                    animation="border"
                                    size="sm"
                                    className="me-2"
                                />

                                Salvando...
                            </>
                        ) : mode ===
                            'create' ? (
                            'Salvar Limite'
                        ) : (
                            'Atualizar Limite'
                        )}
                    </Button>

                </Modal.Footer>
            </Form>
        </Modal>
    );
}