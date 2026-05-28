import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    goalSchema,
    type GoalFormData
} from '../../schemas/goalSchema';
import { useGoalsStore } from '../../store/goalsStore';
import styles from '../../styles/goals/goalModal.module.css';

interface GoalModalProps {
    show: boolean;
    handleClose: () => void;
}

export function GoalModal({
    show,
    handleClose
}: GoalModalProps) {
    const createGoal = useGoalsStore(
        (state) => state.createGoal
    );

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<GoalFormData>({
        resolver: zodResolver(goalSchema)
    });

    async function onSubmit(data: GoalFormData) {
        try {
            await createGoal(data);

            reset();

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
                    Nova Meta Financeira
                </Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>
                            Nome da Meta
                        </Form.Label>

                        <Form.Control
                            type="text"
                            placeholder="Ex: Reserva de Emergência"
                            {...register('name')}
                            isInvalid={!!errors.name}
                            className={styles['custom-placeholder']}
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
                            placeholder="Ex.: 0.01"
                            {...register('targetAmount', {
                                valueAsNumber: true
                            })}
                            isInvalid={!!errors.targetAmount}
                            className={styles['custom-placeholder']}
                        />

                        <Form.Control.Feedback type="invalid">
                            {errors.targetAmount?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>
                            Prazo
                        </Form.Label>

                        <Form.Control
                            type="date"
                            {...register('deadline')}
                            isInvalid={!!errors.deadline}
                            className={styles['custom-placeholder']}
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
                            'Criar Meta'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}