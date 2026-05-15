import { Modal, Button } from 'react-bootstrap';

interface Props {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
}

export default function ConfirmDeleteModal({
    show,
    onClose,
    onConfirm,
    title = 'Confirmar exclusão',
    message = 'Deseja realmente excluir este item?'
}: Props) {
    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p>{message}</p>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Cancelar
                </Button>

                <Button variant="danger" onClick={onConfirm}>
                    Excluir
                </Button>
            </Modal.Footer>
        </Modal>
    );
}