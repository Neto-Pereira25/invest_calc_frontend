import {
    Button,
    Modal
} from 'react-bootstrap';

import type { Goal } from '../../types/goal';

import { useGoalsStore } from '../../store/goalsStore';

interface DeleteGoalModalProps {
    show: boolean;
    handleClose: () => void;

    goal: Goal | null;
}

export function DeleteGoalModal({
    show,
    handleClose,
    goal
}: DeleteGoalModalProps) {
    const deleteGoal = useGoalsStore(
        (state) => state.deleteGoal
    );

    async function handleDelete() {
        if (!goal) return;

        try {
            await deleteGoal(goal.id);

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
                    Excluir Meta
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p className="mb-0">
                    Deseja realmente excluir a meta{' '}
                    <strong>{goal?.name}</strong>?
                </p>
            </Modal.Body>

            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={handleClose}
                >
                    Cancelar
                </Button>

                <Button
                    variant="danger"
                    onClick={handleDelete}
                    data-testid="goal-delete-confirm"
                >
                    Excluir
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
