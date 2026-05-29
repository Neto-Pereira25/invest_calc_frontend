import { Card, ProgressBar, Badge, Dropdown } from 'react-bootstrap';

import {
    MoreVertical,
    Pencil,
    Trash2
} from 'lucide-react';

import type { Goal } from '../../types/goal';

interface GoalCardProps {
    goal: Goal;

    onEdit: (goal: Goal) => void;

    onDelete: (goal: Goal) => void;
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

function formatCurrency(value: number) {
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
    onDelete
}: GoalCardProps) {
    const progress = Math.min(
        goal.progressPercentage || 0,
        100
    );

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
                            >
                                <MoreVertical size={18} />
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item
                                    onClick={() =>
                                        onEdit(goal)
                                    }
                                    className="d-flex align-items-center gap-2"
                                >
                                    <Pencil size={16} />

                                    Editar
                                </Dropdown.Item>

                                <Dropdown.Item
                                    onClick={() =>
                                        onDelete(goal)
                                    }
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

                <ProgressBar
                    now={progress}
                    label={`${progress}%`}
                    className="mt-3"
                />
            </Card.Body>
        </Card>
    );
}
