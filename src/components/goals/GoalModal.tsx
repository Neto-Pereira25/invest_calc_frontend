import { useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    goalSchema,
    type GoalFormData
} from '../../schemas/goalSchema';
import { useGoalsStore } from '../../store/goalsStore';
// import styles from '../../styles/goals/goalModal.module.css';
import type { Goal } from '../../types/goal';

interface GoalModalProps {
    show: boolean;
    handleClose: () => void;

    mode: 'create' | 'edit';

    goal?: Goal | null;
}

export function GoalModal({
    show,
    handleClose,
    mode,
    goal
}: GoalModalProps) {
    const createGoal = useGoalsStore(
        (state) => state.createGoal
    );

    const updateGoal = useGoalsStore(
        (state) => state.updateGoal
    );

    const {
        register,
        handleSubmit,
        reset,
        formState: {
            errors,
            isSubmitting
        }
    } = useForm<GoalFormData>({
        resolver: zodResolver(goalSchema)
    });

    useEffect(() => {
        if (mode === 'edit' && goal) {
            reset({
                name: goal.name,
                targetAmount: goal.targetAmount,
                deadline: goal.deadline.split('T')[0]
            });
        }

        if (mode === 'create') {
            reset({
                name: '',
                targetAmount: 0,
                deadline: ''
            });
        }
    }, [goal, mode, reset]);

    async function onSubmit(
        data: GoalFormData
    ) {
        try {
            if (
                mode === 'edit' &&
                goal
            ) {
                await updateGoal(
                    goal.id,
                    data
                );
            } else {
                await createGoal(data);
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
                        ? 'Nova Meta'
                        : 'Editar Meta'}
                </Modal.Title>
            </Modal.Header>

            <Form
                onSubmit={handleSubmit(onSubmit)}
            >
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>
                            Nome da Meta
                        </Form.Label>

                        <Form.Control
                            type="text"
                            data-testid="goal-name"
                            {...register('name')}
                            isInvalid={!!errors.name}
                        />

                        <Form.Control.Feedback type="invalid">
                            {errors.name?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>
                            Valor Alvo
                        </Form.Label>

                        <Form.Control
                            type="number"
                            step="0.01"
                            data-testid="goal-target-amount"
                            {...register(
                                'targetAmount',
                                {
                                    valueAsNumber: true
                                }
                            )}
                            isInvalid={
                                !!errors.targetAmount
                            }
                        />

                        <Form.Control.Feedback type="invalid">
                            {
                                errors.targetAmount
                                    ?.message
                            }
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>
                            Prazo
                        </Form.Label>

                        <Form.Control
                            type="date"
                            data-testid="goal-deadline"
                            {...register('deadline')}
                            isInvalid={
                                !!errors.deadline
                            }
                        />

                        <Form.Control.Feedback type="invalid">
                            {errors.deadline?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={handleClose}
                        data-testid="goal-cancel"
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="submit"
                        data-testid="goal-submit"
                        disabled={isSubmitting}
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
                        ) : mode === 'create' ? (
                            'Criar Meta'
                        ) : (
                            'Salvar Alterações'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
