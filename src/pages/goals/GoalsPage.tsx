import { useEffect, useState } from 'react';

import {
    Button,
    Col,
    Container,
    Row,
    Spinner
} from 'react-bootstrap';

import { Plus } from 'lucide-react';

import { GoalCard } from '../../components/goals/GoalCard';
import { GoalModal } from '../../components/goals/GoalModal';

import { useGoalsStore } from '../../store/goalsStore';
import { DeleteGoalModal } from '../../components/goals/DeleteGoalModal';
import type { Goal } from '../../types/goal';

export function GoalsPage() {
    const [showGoalModal, setShowGoalModal] = useState(false);

    const [
        showDeleteModal,
        setShowDeleteModal
    ] = useState(false);

    const [modalMode, setModalMode] =
        useState<'create' | 'edit'>(
            'create'
        );

    const [
        selectedGoal,
        setSelectedGoal
    ] = useState<Goal | null>(null);

    const goals = useGoalsStore(
        (state) => state.goals
    );

    const loading = useGoalsStore(
        (state) => state.loading
    );

    const fetchGoals = useGoalsStore(
        (state) => state.fetchGoals
    );

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    function handleOpenCreateModal() {
        setModalMode('create');

        setSelectedGoal(null);

        setShowGoalModal(true);
    }

    function handleOpenEditModal(
        goal: Goal
    ) {
        setModalMode('edit');

        setSelectedGoal(goal);

        setShowGoalModal(true);
    }

    function handleOpenDeleteModal(
        goal: Goal
    ) {
        setSelectedGoal(goal);

        setShowDeleteModal(true);
    }

    function handleCloseGoalModal() {
        setShowGoalModal(false);

        setSelectedGoal(null);
    }

    function handleCloseDeleteModal() {
        setShowDeleteModal(false);

        setSelectedGoal(null);
    }

    return (
        <Container
            fluid
            className="py-4 px-4"
        >
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">
                        Metas Financeiras
                    </h2>

                    <p className="text-muted mb-0">
                        Organize seus objetivos financeiros.
                    </p>
                </div>

                <Button
                    onClick={
                        handleOpenCreateModal
                    }
                    className="d-flex align-items-center gap-2"
                >
                    <Plus size={18} />

                    Nova Meta
                </Button>
            </div>

            {loading ? (
                <div className="d-flex justify-content-center py-5">
                    <Spinner animation="border" />
                </div>
            ) : goals.length === 0 ? (
                <div className="text-center py-5">
                    <h5 className="fw-semibold">
                        Nenhuma meta cadastrada
                    </h5>

                    <p className="text-muted">
                        Clique em “Nova Meta”
                        para criar sua primeira
                        meta financeira.
                    </p>
                </div>
            ) : (
                <Row className="g-4">
                    {goals.map((goal) => (
                        <Col
                            key={goal.id}
                            xs={12}
                            md={6}
                            xl={4}
                        >
                            <GoalCard
                                goal={goal}
                                onEdit={
                                    handleOpenEditModal
                                }
                                onDelete={
                                    handleOpenDeleteModal
                                }
                            />
                        </Col>
                    ))}
                </Row>
            )}

            <GoalModal
                show={showGoalModal}
                handleClose={
                    handleCloseGoalModal
                }
                mode={modalMode}
                goal={selectedGoal}
            />

            <DeleteGoalModal
                show={showDeleteModal}
                handleClose={
                    handleCloseDeleteModal
                }
                goal={selectedGoal}
            />
        </Container>
    );
}