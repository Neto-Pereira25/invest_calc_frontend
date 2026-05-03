import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import TransactionModal from '../components/TransactionModal';
import { useTransactionsStore } from '../store/transactionsStore';
import type { Transaction } from '../types/transaction';
import s from './TransactionsPage.module.css';

export default function TransactionsPage() {
    const transactions = useTransactionsStore((s) => s.items);
    const fetchTransactions = useTransactionsStore((s) => s.fetchTransactions);

    const [showModal, setShowModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const removeTransaction = useTransactionsStore((s) => s.removeTransaction);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);


    const handleDelete = async (id: number) => {
        if (confirm('Deseja realmente excluir este lançamento?')) {
            await removeTransaction(id);
        }
    };

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }

    function formatAmount(amount: number) {
        return amount.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    return (
        <div className={s.page}>
            <div className={s.header}>
                <div>
                    <h1 className={s.title}>Lancamentos</h1>
                    <p className={s.subtitle}>Gerencie suas receitas e despesas</p>
                </div>

                <Button className={s.newButton} size="lg" onClick={() => setShowModal(true)}>
                    + Nova transacao
                </Button>
            </div>

            <section className={s.tableCard}>
                <header className={s.tableHead}>
                    <span className={s.descriptionLabel}>Descricao</span>
                    <span className={s.amountLabel}>Valor</span>
                    <span className={s.actionsLabel}>Acoes</span>
                </header>

                {transactions.length === 0 ? (
                    <div className={s.empty}>Nenhum lancamento ainda.</div>
                ) : (
                    transactions.map((t) => (
                        <article key={t.id} className={s.row}>
                            <div className={`${s.icon} ${t.type === 'INCOME' ? s.incomeIcon : s.expenseIcon}`}>
                                {t.type === 'INCOME' ? '↑' : '↓'}
                            </div>

                            <div className={s.info}>
                                <div className={s.description}>{t.description}</div>
                                <div className={s.meta}>
                                    {t.subcategory || t.category} • {formatDate(t.date)}
                                </div>
                            </div>

                            <div className={`${s.amount} ${t.type === 'INCOME' ? s.income : s.expense}`}>
                                {t.type === 'INCOME' ? '+' : '-'} {formatAmount(t.amount)}
                            </div>

                            <div className={s.actions}>
                                <Button
                                    className={s.actionButton}
                                    onClick={() => {
                                        setEditingTransaction(t);
                                        setShowModal(true);
                                    }}
                                >
                                    <FaEdit /> Editar
                                </Button>

                                <Button className={`${s.actionButton} ${s.deleteButton}`} onClick={() => handleDelete(t.id)}>
                                    <FaTrash /> Excluir
                                </Button>
                            </div>
                        </article>
                    ))
                )}
            </section>

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