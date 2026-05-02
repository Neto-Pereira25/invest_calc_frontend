import { useEffect } from 'react';
import { useTransactionsStore } from '../store/transactionsStore';
import s from './Dashboard.module.css';

export default function DashboardPage() {
    const transactions = useTransactionsStore((state) => state.items);
    const fetchTransactions = useTransactionsStore((state) => state.fetchTransactions);


    useEffect(() => {
        if (transactions.length === 0) {
            fetchTransactions();
        }
    }, [transactions.length, fetchTransactions]);

    // 🔥 adapta para seu backend (INCOME / EXPENSE)
    const income = transactions
        .filter((t) => t.type === 'INCOME')
        .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((acc, t) => acc + t.amount, 0);

    const balance = income - expense;

    return (
        <div>
            <header className={s.header}>
                <h1 className={s.greet}>Dashboard</h1>
                <p className={s.sub}>Resumo das suas finanças</p>
            </header>

            {/* 📊 CARDS */}
            <div className={s.grid}>
                <div className={s.stat}>
                    <div className={s.statLabel}>Receitas</div>
                    <div className={`${s.statValue} ${s.pos}`}>
                        R$ {income.toFixed(2)}
                    </div>
                    <div className={s.statSub}>
                        {transactions.filter(t => t.type === 'INCOME').length} lançamento(s)
                    </div>
                </div>

                <div className={s.stat}>
                    <div className={s.statLabel}>Despesas</div>
                    <div className={`${s.statValue} ${s.neg}`}>
                        R$ {expense.toFixed(2)}
                    </div>
                    <div className={s.statSub}>
                        {transactions.filter(t => t.type === 'EXPENSE').length} lançamento(s)
                    </div>
                </div>

                <div className={s.stat}>
                    <div className={s.statLabel}>Saldo</div>
                    <div
                        className={`${s.statValue} ${balance >= 0 ? s.pos : s.neg}`}
                    >
                        R$ {balance.toFixed(2)}
                    </div>
                    <div className={s.statSub}>
                        Receitas − Despesas
                    </div>
                </div>
            </div>

            {/* 📋 LISTA */}
            <section className={s.section}>
                <div className={s.sectionTitle}>
                    <span>Lançamentos recentes</span>
                </div>

                {transactions.length === 0 ? (
                    <div className={s.empty}>
                        Nenhum lançamento ainda.
                    </div>
                ) : (
                    transactions.slice(0, 6).map((t) => (
                        <div key={t.id} className={s.row}>
                            <div
                                className={`${s.rowIcon} ${t.type === 'INCOME' ? s.income : s.expense
                                    }`}
                            >
                                {t.type === 'INCOME' ? '↑' : '↓'}
                            </div>

                            <div className={s.rowMain}>
                                <div className={s.rowDesc}>
                                    {t.description}
                                </div>
                                <div className={s.rowMeta}>
                                    {new Date(t.date).toLocaleDateString()}
                                </div>
                            </div>

                            <div
                                className={`${s.rowAmount} ${t.type === 'INCOME' ? s.income : s.expense
                                    }`}
                            >
                                {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount}
                            </div>
                        </div>
                    ))
                )}
            </section>
        </div>
    );
}