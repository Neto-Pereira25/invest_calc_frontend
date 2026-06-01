import {
    Modal,
    Button,
    Spinner
} from 'react-bootstrap';

import { useState } from 'react';

import { useSpendingLimitStore }
    from '../../store/spendingLimitStore';

interface DeleteSpendingLimitModalProps {
    show: boolean;
    handleClose: () => void;
}

export function DeleteSpendingLimitModal({
    show,
    handleClose
}: DeleteSpendingLimitModalProps) {

    const [loading, setLoading] =
        useState(false);

    const deleteSpendingLimit =
        useSpendingLimitStore(
            (state) =>
                state.deleteSpendingLimit
        );

    async function handleDelete() {

        try {

            setLoading(true);

            await deleteSpendingLimit();

            handleClose();

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
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
                    Remover Limite Mensal
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p className="mb-0">
                    Deseja realmente remover o
                    limite mensal de gastos?
                </p>

                <small className="text-muted">
                    Esta ação poderá ser refeita
                    posteriormente criando um novo
                    limite.
                </small>
            </Modal.Body>

            <Modal.Footer>

                <Button
                    variant="secondary"
                    onClick={handleClose}
                    disabled={loading}
                >
                    Cancelar
                </Button>

                <Button
                    variant="danger"
                    onClick={handleDelete}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Spinner
                                animation="border"
                                size="sm"
                                className="me-2"
                            />

                            Removendo...
                        </>
                    ) : (
                        'Remover'
                    )}
                </Button>

            </Modal.Footer>
        </Modal>
    );
}