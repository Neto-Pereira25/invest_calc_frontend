import {
    Card,
    ProgressBar,
    Badge,
    Dropdown
} from 'react-bootstrap';

import {
    MoreVertical,
    Pencil,
    Trash2,
    TrendingUp
} from 'lucide-react';

import type { Goal } from '../../types/goal';

interface GoalCardProps {
    goal: Goal;

    onEdit: (goal: Goal) => void;

    onDelete: (goal: Goal) => void;

    onUpdateProgress: (
        goal: Goal
    ) => void;
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

function getProgressVariant(
    status: string
) {
    switch (status) {
        case 'COMPLETED':
            return 'success';

        case 'OVERDUE':
            return 'danger';

        default:
            return 'primary';
    }
}

function formatCurrency(
    value: number
) {
    return new Intl.NumberFormat(
        'pt-BR',
        {
            style: 'currency',
            currency: 'BRL'
        }
    ).format(value);
}

export function GoalCard({
    goal,
    onEdit,
    onDelete,
    onUpdateProgress
}: GoalCardProps) {
    const progress = Math.min(
        goal.progressPercentage || 0,
        100
    );

    const remaining =
        goal.targetAmount -
        goal.currentAmount;

    return (
        <Card
            className="shadow-sm border-0 h-100"
            data-testid="goal-card"
        >
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h5 className="fw-semibold mb-1">
                            {goal.name}
                        </h5>

                        <small className="text-muted">
                            Prazo:{' '}
                            {new Date(
                                goal.deadline
                            ).toLocaleDateString(
                                'pt-BR'
                            )}
                        </small>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <Badge
                            bg={getBadgeVariant(
                                goal.status
                            )}
                        >
                            {translateStatus(
                                goal.status
                            )}
                        </Badge>

                        <Dropdown align="end">
                            <Dropdown.Toggle
                                variant="light"
                                size="sm"
                                className="border-0 shadow-none"
                                data-testid="goal-actions"
                            >
                                <MoreVertical size={18} />
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item
                                    onClick={() =>
                                        onUpdateProgress(
                                            goal
                                        )
                                    }
                                    data-testid="goal-update-progress"
                                    className="d-flex align-items-center gap-2"
                                >
                                    <TrendingUp size={16} />

                                    Atualizar Progresso
                                </Dropdown.Item>

                                <Dropdown.Item
                                    onClick={() =>
                                        onEdit(goal)
                                    }
                                    data-testid="goal-edit"
                                    className="d-flex align-items-center gap-2"
                                >
                                    <Pencil size={16} />

                                    Editar
                                </Dropdown.Item>

                                <Dropdown.Divider />

                                <Dropdown.Item
                                    onClick={() =>
                                        onDelete(goal)
                                    }
                                    data-testid="goal-delete"
                                    className="d-flex align-items-center gap-2 text-danger"
                                >
                                    <Trash2 size={16} />

                                    Excluir
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>

                <div className="mb-2">
                    <span className="fw-bold fs-5">
                        {formatCurrency(
                            goal.currentAmount
                        )}
                    </span>

                    <span className="text-muted">
                        {' '}de{' '}
                        {formatCurrency(
                            goal.targetAmount
                        )}
                    </span>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted">
                        Faltam{' '}
                        <strong>
                            {formatCurrency(
                                Math.max(
                                    remaining,
                                    0
                                )
                            )}
                        </strong>
                    </small>

                    <small className="fw-semibold">
                        {progress.toFixed(0)}%
                    </small>
                </div>

                <ProgressBar
                    now={progress}
                    variant={getProgressVariant(
                        goal.status
                    )}
                    className="mt-2"
                />
            </Card.Body>
        </Card>
    );
}
