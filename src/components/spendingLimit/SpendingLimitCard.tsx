import {
    Card,
    Button,
    Dropdown
} from 'react-bootstrap';

import {
    MoreVertical,
    Pencil,
    Trash2,
    Wallet
} from 'lucide-react';

import type { SpendingLimit } from '../../types/spendingLimit';

interface SpendingLimitCardProps {
    spendingLimit: SpendingLimit | null;

    onCreate: () => void;

    onEdit: () => void;

    onDelete: () => void;
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

export function SpendingLimitCard({
    spendingLimit,
    onCreate,
    onEdit,
    onDelete
}: SpendingLimitCardProps) {

    if (!spendingLimit) {
        return (
            <Card
                className="shadow-sm border-0"
                data-testid="spending-limit-empty"
            >
                <Card.Body className="text-center py-5">

                    <Wallet
                        size={48}
                        className="mb-3 text-muted"
                    />

                    <h5 className="fw-semibold">
                        Nenhum limite configurado
                    </h5>

                    <p className="text-muted">
                        Defina um limite mensal para
                        controlar melhor seus gastos.
                    </p>

                    <Button
                        data-testid="spending-limit-create"
                        onClick={onCreate}
                    >
                        Definir Limite
                    </Button>

                </Card.Body>
            </Card>
        );
    }

    return (
        <Card
            className="shadow-sm border-0"
            data-testid="spending-limit-card"
        >
            <Card.Body>

                <div className="d-flex justify-content-between align-items-start mb-3">

                    <div>
                        <h5 className="fw-semibold mb-1">
                            Limite Mensal
                        </h5>

                        <small className="text-muted">
                            Última atualização:
                            {' '}
                            {new Date(
                                spendingLimit.updatedAt
                            ).toLocaleDateString(
                                'pt-BR'
                            )}
                        </small>
                    </div>

                    <Dropdown align="end">

                        <Dropdown.Toggle
                            data-testid="spending-limit-actions"
                            variant="light"
                            size="sm"
                            className="border-0 shadow-none"
                        >
                            <MoreVertical size={18} />
                        </Dropdown.Toggle>

                        <Dropdown.Menu>

                            <Dropdown.Item
                                data-testid="spending-limit-edit"
                                onClick={onEdit}
                                className="d-flex align-items-center gap-2"
                            >
                                <Pencil size={16} />

                                Editar
                            </Dropdown.Item>

                            <Dropdown.Divider />

                            <Dropdown.Item
                                data-testid="spending-limit-delete"
                                onClick={onDelete}
                                className="d-flex align-items-center gap-2 text-danger"
                            >
                                <Trash2 size={16} />

                                Remover
                            </Dropdown.Item>

                        </Dropdown.Menu>

                    </Dropdown>

                </div>

                <div className="mt-4">
                    <h2
                        className="fw-bold"
                        data-testid="spending-limit-value"
                    >
                        {formatCurrency(
                            spendingLimit.amount
                        )}
                    </h2>

                    <small className="text-muted">
                        Limite mensal configurado
                    </small>
                </div>

            </Card.Body>
        </Card>
    );
}
