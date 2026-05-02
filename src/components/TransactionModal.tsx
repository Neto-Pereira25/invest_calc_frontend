import { useEffect, useMemo, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { FaPiggyBank } from 'react-icons/fa';
import { MdAttachMoney } from 'react-icons/md';
import { getCategories } from '../lib/categoryService';
import '../styles/modal.css';
import type { Category } from '../types/category';

type Props = {
    show: boolean;
    onClose: () => void;
};

export default function TransactionModal({ show, onClose }: Props) {
    const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
    const [categories, setCategories] = useState<Category[]>([]);

    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [subcategory, setSubcategory] = useState<string | null>(null);

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');

    // 🔥 carregar categorias
    useEffect(() => {
        async function load() {
            const data = await getCategories();
            setCategories(data);
        }

        if (show) load();
    }, [show]);

    // 🔥 categorias filtradas (DERIVADO)
    const filteredCategories = useMemo(() => {
        return categories.filter((c) => c.type === type);
    }, [categories, type]);

    // 🔥 categoria selecionada (DERIVADO)
    const selectedCategory = useMemo(() => {
        return (
            filteredCategories.find((c) => c.id === selectedCategoryId) ||
            filteredCategories[0] ||
            null
        );
    }, [filteredCategories, selectedCategoryId]);

    // 🔥 subcategoria FINAL (DERIVADA + CONTROLADA)
    const finalSubcategory =
        subcategory ??
        selectedCategory?.subcategories[0]?.name ??
        '';

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        console.log({
            description,
            amount: Number(amount),
            type,
            category: selectedCategory?.name,
            subcategory: finalSubcategory,
            date,
        });

        onClose();
    };
    // FaArrowUp, FaArrowDown
    return (
        <Modal show={show} onHide={onClose} centered size='lg'>
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
                    Nova Transação
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
                                setSubcategory(null);
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
                                setSubcategory(null);
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
                                setSubcategory(null); // 🔥 reset subcategoria
                            }}
                        >
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
                            value={finalSubcategory}
                            onChange={(e) => setSubcategory(e.target.value)}
                        >
                            {selectedCategory?.subcategories.map((sub) => (
                                <option key={sub.id} value={sub.name}>
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
                        Adicionar lançamento
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}