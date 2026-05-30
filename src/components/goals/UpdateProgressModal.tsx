import {
    Modal,
    Button,
    Form,
    Spinner
} from 'react-bootstrap';

import { useForm } from 'react-hook-form';

import type { Goal } from '../../types/goal';

import { useGoalsStore } from '../../store/goalsStore';

interface FormData {
    currentAmount: number;
}

interface UpdateProgressModalProps {
    show: boolean;
    handleClose: () => void;

    goal: Goal | null;
}

export function UpdateProgressModal({
    show,
    handleClose,
    goal
}: UpdateProgressModalProps) {
    const updateGoalProgress =
        useGoalsStore(
            (state) =>
                state.updateGoalProgress
        );

    const {
        register,
        handleSubmit,
        formState: {
            isSubmitting
        }
    } = useForm<FormData>({
        defaultValues: {
            currentAmount:
                goal?.currentAmount || 0
        }
    });

    async function onSubmit(
        data: FormData
    ) {
        if (!goal) return;

        try {
            await updateGoalProgress(
                goal.id,
                data.currentAmount
            );

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
                    Atualizar Progresso
                </Modal.Title>
            </Modal.Header>

            <Form
                onSubmit={handleSubmit(onSubmit)}
            >
                <Modal.Body>
                    <div className="mb-3">
                        <h5 className="fw-semibold">
                            {goal?.name}
                        </h5>

                        <p className="text-muted mb-0">
                            Meta:{' '}
                            {new Intl.NumberFormat(
                                'pt-BR',
                                {
                                    style: 'currency',
                                    currency: 'BRL'
                                }
                            ).format(
                                goal?.targetAmount || 0
                            )}
                        </p>
                    </div>

                    <Form.Group>
                        <Form.Label>
                            Valor Atual
                        </Form.Label>

                        <Form.Control
                            type="number"
                            step="0.01"
                            {...register(
                                'currentAmount',
                                {
                                    valueAsNumber: true
                                }
                            )}
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={handleClose}
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="submit"
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
                        ) : (
                            'Atualizar'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}