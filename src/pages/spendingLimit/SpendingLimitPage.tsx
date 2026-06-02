import { useEffect, useState } from 'react';

import {
    Container,
    Row,
    Col,
    Spinner
} from 'react-bootstrap';

import { SpendingLimitCard } from '../../components/spendingLimit/SpendingLimitCard';

import { SpendingLimitModal } from '../../components/spendingLimit/SpendingLimitModal';

import { DeleteSpendingLimitModal } from '../../components/spendingLimit/DeleteSpendingLimitModal';

import { useSpendingLimitStore } from '../../store/spendingLimitStore';

export function SpendingLimitPage() {

    const [showModal, setShowModal] = useState(false);

    const [mode, setMode] = useState<'create' | 'edit'>('create');

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const spendingLimit =
        useSpendingLimitStore(
            (state) => state.spendingLimit
        );

    const loading = useSpendingLimitStore(
        (state) => state.loading
    );

    const fetchSpendingLimit = useSpendingLimitStore(
        (state) => state.fetchSpendingLimit
    );

    useEffect(() => {
        fetchSpendingLimit();
    }, [fetchSpendingLimit]);

    function handleCreate() {
        setMode('create');
        setShowModal(true);
    }

    function handleEdit() {
        setMode('edit');
        setShowModal(true);
    }

    async function handleDelete() {
        setShowDeleteModal(true);
    }

    function handleCloseDeleteModal() {
        setShowDeleteModal(false);
    }

    return (
        <Container
            fluid
            className="py-4 px-4"
        >
            <div className="mb-4">
                <h2 className="fw-bold mb-1">
                    Limite Mensal de Gastos
                </h2>

                <p className="text-muted mb-0">
                    Defina um limite para controlar
                    melhor suas despesas.
                </p>
            </div>

            {loading ? (
                <div className="d-flex justify-content-center py-5">
                    <Spinner
                        animation="border"
                    />
                </div>
            ) : (
                <Row>
                    <Col
                        xs={12}
                        md={8}
                        lg={6}
                    >
                        <SpendingLimitCard
                            spendingLimit={
                                spendingLimit
                            }
                            onCreate={
                                handleCreate
                            }
                            onEdit={
                                handleEdit
                            }
                            onDelete={
                                handleDelete
                            }
                        />
                    </Col>
                </Row>
            )}

            <SpendingLimitModal
                show={showModal}
                handleClose={() =>
                    setShowModal(false)
                }
                mode={mode}
                spendingLimit={
                    spendingLimit
                }
            />

            <DeleteSpendingLimitModal
                show={showDeleteModal}
                handleClose={
                    handleCloseDeleteModal
                }
            />
        </Container>
    );
}