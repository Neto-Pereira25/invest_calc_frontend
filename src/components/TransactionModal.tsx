import { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useTransactionsStore } from '../store/transactionsStore';
import { getCategories } from '../lib/categoryService';
import type { Category } from '../types/category';
import { FaPiggyBank } from 'react-icons/fa';
import { MdAttachMoney } from 'react-icons/md';
import '../styles/modal.css';
import type { Transaction } from '../types/transaction';

interface Props {
    show: boolean;
    onClose: () => void;
    transaction: Transaction | null;
}

export default function TransactionModal({ show, onClose, transaction }: Props) {
    const addTransaction = useTransactionsStore((state) => state.addTransaction);
    const editTransaction = useTransactionsStore((state) => state.editTransaction);

    const isEdit = !!transaction;

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');

    const [categories, setCategories] = useState<Category[]>([]);
    const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');

    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [subcategoryId, setSubcategoryId] = useState<number | null>(null);

    // ✅ carregar categorias (único useEffect necessário)
    useEffect(() => {
        async function load() {
            const data = await getCategories();
            setCategories(data);
        }
        load();
    }, []);

    // ✅ filtrar categorias por tipo
    const filteredCategories = useMemo(() => {
        return categories.filter((c) => c.type === type);
    }, [categories, type]);

    // ✅ categoria selecionada (ou primeira)
    const selectedCategory =
        filteredCategories.find((c) => c.id === selectedCategoryId) ||
        filteredCategories[0] ||
        null;

    // 🔥 RESET FORM (sem useEffect problemático)
    const resetForm = () => {
        if (transaction) {
            setDescription(transaction.description);
            setAmount(String(transaction.amount));
            setDate(transaction.date);

            // tenta inferir tipo (opcional)
            setType(transaction.type);

        } else {
            setDescription('');
            setAmount('');
            setDate('');
            setType('EXPENSE');
        }

        setSelectedCategoryId(null);
        setSubcategoryId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!subcategoryId) {
            alert('Selecione uma subcategoria');
            return;
        }

        const payload = {
            description,
            amount: Number(amount),
            date,
            subcategoryId,
        };

        if (isEdit && transaction) {
            await editTransaction(transaction.id, payload);
        } else {
            await addTransaction(payload);
        }

        onClose();
    };

    return (
        <Modal
            show={show}
            onHide={onClose}
            onShow={resetForm}
            centered
            size='lg'>
            <Modal.Header closeButton>
                <Modal.Title
                    style={{
                        fontSize: '28px',
                        fontWeight: 700,
                        color: type === 'INCOME' ? '#198754' : '#dc3545',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}
                >
                    {
                        type === 'INCOME'
                            ? <FaPiggyBank style={{ marginRight: 8 }} size={32} />
                            : <MdAttachMoney style={{ marginRight: 8 }} size={32} />
                    }
                    {isEdit ? 'Editar Transação' : 'Nova Transação'}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    {/* 🔥 TOGGLE */}
                    <div className="d-flex mb-3 gap-2">
                        <Button
                            type="button"
                            variant={type === 'INCOME' ? 'success' : 'outline-secondary'}
                            className="w-100"
                            onClick={() => {
                                setType('INCOME');
                                setSelectedCategoryId(null);
                                setSubcategoryId(null);
                            }}
                            style={{
                                fontSize: '24px',
                                fontWeight: 700
                            }}
                        >
                            ↑ Receita
                        </Button>

                        <Button
                            type="button"
                            variant={type === 'EXPENSE' ? 'danger' : 'outline-secondary'}
                            className="w-100"
                            onClick={() => {
                                setType('EXPENSE');
                                setSelectedCategoryId(null);
                                setSubcategoryId(null);
                            }}
                            style={{
                                fontSize: '24px',
                                fontWeight: 700
                            }}
                        >
                            ↓ Despesa
                        </Button>
                    </div>

                    {/* DESCRIÇÃO */}
                    <Form.Group className="mb-3">
                        <Form.Label>Descrição</Form.Label>
                        <Form.Control
                            size="lg"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Form.Group>

                    {/* CATEGORIA */}
                    <Form.Group className="mb-3">
                        <Form.Label>Categoria</Form.Label>
                        <Form.Select
                            size="lg"
                            value={selectedCategory?.id || ''}
                            onChange={(e) => {
                                setSelectedCategoryId(Number(e.target.value));
                                setSubcategoryId(null);
                            }}
                        >
                            <option value="">Selecione</option>
                            {filteredCategories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {/* SUBCATEGORIA */}
                    <Form.Group className="mb-3">
                        <Form.Label>Subcategoria</Form.Label>
                        <Form.Select
                            size="lg"
                            value={subcategoryId || ''}
                            onChange={(e) => setSubcategoryId(Number(e.target.value))}
                        >
                            <option value="">Selecione</option>
                            {selectedCategory?.subcategories.map((sub) => (
                                <option key={sub.id} value={sub.id}>
                                    {sub.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {/* VALOR */}
                    <Form.Group className="mb-3">
                        <Form.Label>Valor (R$)</Form.Label>
                        <Form.Control
                            size="lg"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </Form.Group>

                    {/* DATA */}
                    <Form.Group className="mb-3">
                        <Form.Label>Data</Form.Label>
                        <Form.Control
                            size="lg"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </Form.Group>

                    <Button
                        type="submit"
                        variant="success"
                        className="w-100"
                        style={{
                            fontSize: '24px',
                            fontWeight: 700
                        }}
                    >
                        {isEdit ? 'Salvar alterações' : 'Adicionar lançamento'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}