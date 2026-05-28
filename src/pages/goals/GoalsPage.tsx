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

export function GoalsPage() {
    const [showModal, setShowModal] = useState(false);

    const goals = useGoalsStore((state) => state.goals);

    const loading = useGoalsStore(
        (state) => state.loading
    );

    const fetchGoals = useGoalsStore(
        (state) => state.fetchGoals
    );

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    return (
        <Container fluid className="py-4 px-4">
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
                    onClick={() => setShowModal(true)}
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
                        Clique em “Nova Meta” para criar sua primeira meta financeira.
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
                            <GoalCard goal={goal} />
                        </Col>
                    ))}
                </Row>
            )}

            <GoalModal
                show={showModal}
                handleClose={() => setShowModal(false)}
            />
        </Container>
    );
}