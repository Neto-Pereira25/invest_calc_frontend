import { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaPiggyBank } from 'react-icons/fa';
import { MdAttachMoney } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransactionsStore, TransactionError } from '../store/transactionsStore';
import { getCategories } from '../lib/categoryService';
import { transactionSchema, type TransactionFormData } from '../schemas/transactionSchema';
import { errorToast, successToast } from './ui/toast';
import type { Category } from '../types/category';
import type { Transaction } from '../types/transaction';
import s from './TransactionModal.module.css';
import '../styles/modal.css';

interface Props {
    show: boolean;
    onClose: () => void;
    transaction: Transaction | null;
}

export default function TransactionModal({ show, onClose, transaction }: Props) {
    const addTransaction = useTransactionsStore((state) => state.addTransaction);
    const editTransaction = useTransactionsStore((state) => state.editTransaction);

    const isEdit = !!transaction;

    const [categories, setCategories] = useState<Category[]>([]);
    const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');

    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            description: '',
            amount: undefined,
            date: '',
            subcategoryId: 0,
        },
    });

    useEffect(() => {
        async function load() {
            const data = await getCategories();
            setCategories(data);
        }
        load();
    }, []);

    const filteredCategories = useMemo(() => {
        return categories.filter((c) => c.type === type);
    }, [categories, type]);

    const selectedCategory =
        filteredCategories.find((c) => c.id === selectedCategoryId) ||
        filteredCategories[0] ||
        null;

    const resetForm = () => {
        if (transaction) {
            reset({
                description: transaction.description,
                amount: transaction.amount,
                date: transaction.date,
                subcategoryId: 0,
            });

            setType(transaction.type);
        } else {
            reset({
                description: '',
                amount: undefined,
                date: '',
                subcategoryId: 0,
            });

            setType('EXPENSE');
        }

        setSelectedCategoryId(null);
    };

    const onSubmit = async (data: TransactionFormData) => {
        try {
            if (isEdit && transaction) {
                await editTransaction(transaction.id, data);
                successToast('Lançamento financeiro editado com sucesso!');
            } else {
                await addTransaction(data);
                successToast('Lançamento financeiro criado com sucesso!');
            }

            onClose();
        } catch (ex) {
            if (ex instanceof TransactionError) {
                if (ex.errors.length > 0) {
                    ex.errors.forEach((msg) => errorToast(msg));
                } else {
                    errorToast(ex.message);
                }
            } else {
                errorToast('Erro ao processar lançamento financeiro');
            }
        }
    };

    return (
        <Modal
            show={show}
            onHide={onClose}
            onShow={resetForm}
            centered
            size='lg'>
            <Modal.Header closeButton>
                <Modal.Title className={`${s.title} ${type === 'INCOME' ? s.incomeTitle : s.expenseTitle}`}>
                    {type === 'INCOME' ? <FaPiggyBank size={30} /> : <MdAttachMoney size={30} />}
                    {isEdit ? 'Editar Transação' : 'Nova Transação'}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <div className={s.typeSwitch}>
                        <Button
                            data-testid="transaction-type-income"
                            type="button"
                            className={`${s.typeButton} ${type === 'INCOME' ? s.typeButtonActiveIncome : ''}`}
                            onClick={() => {
                                setType('INCOME');
                                setSelectedCategoryId(null);
                                setValue('subcategoryId', 0);
                            }}
                        >
                            ↑ Receita
                        </Button>

                        <Button
                            data-testid="transaction-type-expense"
                            type="button"
                            className={`${s.typeButton} ${type === 'EXPENSE' ? s.typeButtonActiveExpense : ''}`}
                            onClick={() => {
                                setType('EXPENSE');
                                setSelectedCategoryId(null);
                                setValue('subcategoryId', 0);
                            }}
                        >
                            ↓ Despesa
                        </Button>
                    </div>

                    {/* DESCRIÇÃO */}
                    <Form.Group className="mb-3">
                        <Form.Label>Descrição</Form.Label>
                        <Form.Control
                            data-testid="transaction-description"
                            size="lg"
                            {...register('description')}
                            isInvalid={!!errors.description}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.description?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* CATEGORIA */}
                    <Form.Group className="mb-3">
                        <Form.Label>Categoria</Form.Label>
                        <Form.Select
                            data-testid="transaction-category"
                            size="lg"
                            value={selectedCategory?.id || ''}
                            onChange={(e) => {
                                setSelectedCategoryId(Number(e.target.value));
                                setValue('subcategoryId', 0);
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
                            data-testid="transaction-subcategory"
                            size="lg"
                            {...register('subcategoryId', { valueAsNumber: true })}
                            isInvalid={!!errors.subcategoryId}
                        >
                            <option value={0}>Selecione</option>
                            {selectedCategory?.subcategories.map((sub) => (
                                <option key={sub.id} value={sub.id}>
                                    {sub.name}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errors.subcategoryId?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* VALOR */}
                    <Form.Group className="mb-3">
                        <Form.Label>Valor (R$)</Form.Label>
                        <Form.Control
                            data-testid="transaction-amount"
                            size="lg"
                            type="number"
                            step="0.01"
                            min="0"
                            {...register('amount', { valueAsNumber: true })}
                            isInvalid={!!errors.amount}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.amount?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* DATA */}
                    <Form.Group className="mb-3">
                        <Form.Label>Data</Form.Label>
                        <Form.Control
                            data-testid="transaction-date"
                            size="lg"
                            type="date"
                            {...register('date')}
                            isInvalid={!!errors.date}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.date?.message}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Button
                        data-testid="transaction-submit"
                        type="submit"
                        variant="success"
                        className={s.submit}
                    >
                        {isEdit ? 'Salvar alterações' : 'Adicionar lançamento'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}
