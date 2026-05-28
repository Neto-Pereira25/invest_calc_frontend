import { Card, ProgressBar, Badge } from 'react-bootstrap';

import type { Goal } from '../../types/goal';

interface GoalCardProps {
    goal: Goal;
}

function translateStatus(status: string) {
    switch (status) {
        case 'ACTIVE':
            return 'Ativa';

        case 'COMPLETED':
            return 'Concluída';

        case 'OVERDUE':
            return 'Atrasada';

        default:
            return status;
    }
}

function getBadgeVariant(status: string) {
    switch (status) {
        case 'ACTIVE':
            return 'primary';

        case 'COMPLETED':
            return 'success';

        case 'OVERDUE':
            return 'danger';

        default:
            return 'secondary';
    }
}

export function GoalCard({
    goal
}: GoalCardProps) {
    return (
        <Card className="shadow-sm border-0 h-100">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h5 className="fw-semibold mb-1">
                            {goal.name}
                        </h5>

                        <small className="text-muted">
                            Prazo:{' '}
                            {new Date(goal.deadline).toLocaleDateString(
                                'pt-BR'
                            )}
                        </small>
                    </div>

                    <Badge bg={getBadgeVariant(goal.status)}>
                        {translateStatus(goal.status)}
                    </Badge>
                </div>

                <div className="mb-2">
                    <span className="fw-bold fs-5">
                        R$ {goal.currentAmount.toFixed(2)}
                    </span>

                    <span className="text-muted">
                        {' '}
                        de R$ {goal.targetAmount.toFixed(2)}
                    </span>
                </div>

                <ProgressBar
                    now={goal.progressPercentage}
                    label={`${goal.progressPercentage}%`}
                    className="mt-3"
                />
            </Card.Body>
        </Card>
    );
}