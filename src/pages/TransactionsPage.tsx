import { useEffect, useState } from 'react';
import {
    Button,
    Card,
    Col,
    Row
} from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import TransactionModal from '../components/TransactionModal';
import { useTransactionsStore } from '../store/transactionsStore';

export default function TransactionsPage() {
    const transactions = useTransactionsStore((s) => s.items);
    const fetchTransactions = useTransactionsStore((s) => s.fetchTransactions);

    const [showModal, setShowModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const removeTransaction = useTransactionsStore((s) => s.removeTransaction);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);


    const handleDelete = async (id: number) => {
        if (confirm('Deseja realmente excluir este lançamento?')) {
            await removeTransaction(id);
        }
    };

    const handleEdit = (id: number) => {
        console.log('Editar:', id);
    };

    return (
        <div>
            {/* 🔥 HEADER DA PÁGINA */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 style={{ marginBottom: 0 }}>Transações</h1>
                    <p style={{ color: '#aaa', fontSize: '20px' }}>
                        Gerencie suas receitas e despesas
                    </p>
                </div>

                <Button
                    style={{
                        fontWeight: 650
                    }}
                    size='lg'
                    variant="success"
                    onClick={() => setShowModal(true)}>
                    + Nova Transação
                </Button>
            </div>

            <Row>
                <Col>
                    <Card bg="dark" text="light">
                        <Card.Header>
                            <div
                                className="d-grid border-bottom pb-2 mb-3 text-muted"
                                style={{
                                    gridTemplateColumns: '40px 1fr auto auto 40px',
                                    fontSize: '20px',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                    opacity: 1,
                                }}
                            >
                                <div></div>
                                <div style={{
                                    color: '#aaa',
                                    fontWeight: 700,
                                }}>Descrição</div>
                                <div style={{
                                    color: '#aaa',
                                    fontWeight: 700,
                                    marginRight: '40px',
                                }}>Valor</div>
                                <div style={{
                                    color: '#aaa',
                                    fontWeight: 700,
                                }}>Ações</div>
                                <div></div>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {/* 🔹 LISTA */}
                            {transactions.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    Nenhuma transação ainda
                                </div>
                            ) : (
                                transactions.map((t) => (
                                    <div
                                        key={t.id}
                                        className="d-grid align-items-center border-bottom py-3"
                                        style={{
                                            gridTemplateColumns: '40px 1fr auto auto',
                                            gap: '12px',
                                        }}
                                    >
                                        {/* 🔥 ÍCONE */}
                                        <div
                                            className="d-flex justify-content-center align-items-center"
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                background:
                                                    t.type === 'INCOME'
                                                        ? 'var(--primary-soft)'
                                                        : 'var(--danger-soft)',
                                                color:
                                                    t.type === 'INCOME'
                                                        ? 'var(--primary)'
                                                        : 'var(--danger)',
                                                fontWeight: 700,
                                                fontSize: '40px',
                                            }}
                                        >
                                            {t.type === 'INCOME' ? '↑' : '↓'}
                                        </div>

                                        {/* 🔹 INFO */}
                                        <div>
                                            <div style={{ fontWeight: 500, fontSize: '26px', }}>
                                                {t.description}
                                            </div>

                                            <div
                                                style={{
                                                    fontSize: '18px',
                                                    color: '#aaa',
                                                    marginTop: '2px',
                                                }}
                                            >
                                                {t.subcategory} •{' '}
                                                {new Date(t.date).toLocaleDateString()}
                                            </div>
                                        </div>

                                        {/* 🔹 VALOR */}
                                        <div
                                            style={{
                                                fontWeight: 600,
                                                fontFamily: 'monospace',
                                                color:
                                                    t.type === 'INCOME'
                                                        ? 'var(--primary)'
                                                        : 'var(--danger)',
                                                fontSize: '26px',
                                                marginRight: '20px',
                                            }}
                                        >
                                            {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount}
                                        </div>

                                        {/* 🔥 AÇÕES */}
                                        <div className="d-flex gap-2">
                                            <Button
                                                variant="outline-primary"
                                                size="lg"
                                                onClick={() => handleEdit(t.id)}
                                            >
                                                <FaEdit />
                                            </Button>

                                            <Button
                                                variant="outline-danger"
                                                size="lg"
                                                onClick={() => handleDelete(t.id)}
                                            >
                                                <FaTrash />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* 🔥 MODAL (BASE) */}
            <TransactionModal
                show={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingTransaction(null);
                }}
                transaction={editingTransaction}
            />
        </div>
    );
}