import { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useTransactionsStore } from '../store/transactionsStore';
import { getCategories } from '../lib/categoryService';
import type { Category } from '../types/category';
import { FaPiggyBank } from 'react-icons/fa';
import { MdAttachMoney } from 'react-icons/md';
import '../styles/modal.css';

interface Props {
    show: boolean;
    onClose: () => void;
}

export default function TransactionModal({ show, onClose }: Props) {
    const addTransaction = useTransactionsStore((state) => state.addTransaction);

    const [categories, setCategories] = useState<Category[]>([]);
    const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');

    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [subcategoryId, setSubcategoryId] = useState<number | null>(null);

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

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

    // ✅ subcategoria selecionada (ou primeira)
    const selectedSubcategoryId =
        subcategoryId ||
        selectedCategory?.subcategories[0]?.id ||
        null;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!selectedSubcategoryId) return;

        await addTransaction({
            description,
            amount: Number(amount),
            date,
            subcategoryId: selectedSubcategoryId,
        });

        // reset
        setDescription('');
        setAmount('');
        setSelectedCategoryId(null);
        setSubcategoryId(null);

        onClose();
    }

    return (
        // <Modal show={show} onHide={onClose} centered size="lg">
        //     <Modal.Header closeButton>
        //         <Modal.Title>Novo lançamento</Modal.Title>
        //     </Modal.Header>

        //     <Modal.Body>
        //         <Form onSubmit={handleSubmit}>
        //             {/* TIPO */}
        //             <div className="d-flex gap-2 mb-3">
        //                 <Button
        //                     variant={type === 'INCOME' ? 'success' : 'outline-success'}
        //                     onClick={() => {
        //                         setType('INCOME');
        //                         setSelectedCategoryId(null);
        //                         setSubcategoryId(null);
        //                     }}
        //                 >
        //                     Receita
        //                 </Button>

        //                 <Button
        //                     variant={type === 'EXPENSE' ? 'danger' : 'outline-danger'}
        //                     onClick={() => {
        //                         setType('EXPENSE');
        //                         setSelectedCategoryId(null);
        //                         setSubcategoryId(null);
        //                     }}
        //                 >
        //                     Despesa
        //                 </Button>
        //             </div>

        //             {/* DESCRIÇÃO */}
        //             <Form.Group className="mb-3">
        //                 <Form.Label>Descrição</Form.Label>
        //                 <Form.Control
        //                     value={description}
        //                     onChange={(e) => setDescription(e.target.value)}
        //                     required
        //                 />
        //             </Form.Group>

        //             {/* CATEGORIA */}
        //             <Form.Group className="mb-3">
        //                 <Form.Label>Categoria</Form.Label>
        //                 <Form.Select
        //                     value={selectedCategory?.id ?? ''}
        //                     onChange={(e) => {
        //                         setSelectedCategoryId(Number(e.target.value));
        //                         setSubcategoryId(null);
        //                     }}
        //                 >
        //                     {filteredCategories.map((cat) => (
        //                         <option key={cat.id} value={cat.id}>
        //                             {cat.name}
        //                         </option>
        //                     ))}
        //                 </Form.Select>
        //             </Form.Group>

        //             {/* SUBCATEGORIA */}
        //             <Form.Group className="mb-3">
        //                 <Form.Label>Subcategoria</Form.Label>
        //                 <Form.Select
        //                     value={selectedSubcategoryId ?? ''}
        //                     onChange={(e) => setSubcategoryId(Number(e.target.value))}
        //                 >
        //                     {selectedCategory?.subcategories.map((sub) => (
        //                         <option key={sub.id} value={sub.id}>
        //                             {sub.name}
        //                         </option>
        //                     ))}
        //                 </Form.Select>
        //             </Form.Group>

        //             {/* VALOR */}
        //             <Form.Group className="mb-3">
        //                 <Form.Label>Valor</Form.Label>
        //                 <Form.Control
        //                     value={amount}
        //                     onChange={(e) => setAmount(e.target.value)}
        //                     required
        //                 />
        //             </Form.Group>

        //             {/* DATA */}
        //             <Form.Group className="mb-3">
        //                 <Form.Label>Data</Form.Label>
        //                 <Form.Control
        //                     type="date"
        //                     value={date}
        //                     onChange={(e) => setDate(e.target.value)}
        //                     required
        //                 />
        //             </Form.Group>

        //             <Button type="submit" className="w-100" variant="success">
        //                 Salvar
        //             </Button>
        //         </Form>
        //     </Modal.Body>
        // </Modal>
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
                                setSubcategoryId(null); // 🔥 reset subcategoria
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
                            value={subcategoryId || ''}
                            onChange={(e) => setSubcategoryId(Number(e.target.value))}
                        >
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