import { useEffect } from 'react';
import { FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { useFinancialSummaryStore } from '../store/financialSummaryStore';
import { useTransactionsStore } from '../store/transactionsStore';
import s from './Dashboard.module.css';

const moneyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

function formatMoney(value: number) {
    return moneyFormatter.format(value);
}

export default function DashboardPage() {
    const transactions = useTransactionsStore((state) => state.items);
    const fetchTransactions = useTransactionsStore((state) => state.fetchTransactions);
    const financialSummary = useFinancialSummaryStore((state) => state.financialSummary);
    const fetchFinancialSummary = useFinancialSummaryStore((state) => state.fetchFinancialSummary);
    const dismissAlert = useFinancialSummaryStore((state) => state.dismissAlert);
    const isDismissed = useFinancialSummaryStore((state) => state.isDismissed);


    useEffect(() => {
        if (transactions.length === 0) {
            fetchTransactions();
        }
    }, [transactions.length, fetchTransactions]);

    useEffect(() => {
        fetchFinancialSummary();
    }, [fetchFinancialSummary]);

    // 🔥 adapta para seu backend (INCOME / EXPENSE)
    const income = transactions
        .filter((t) => t.type === 'INCOME')
        .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((acc, t) => acc + t.amount, 0);

    const balance = income - expense;

    const isExceeded = Boolean(financialSummary?.isExceeded);
    const isNearLimit = Boolean(financialSummary?.isNearLimit);
    const shouldShowAlert = Boolean(financialSummary) && (isNearLimit || isExceeded) && !isDismissed;

    const exceededAmount = financialSummary
        ? Math.max(financialSummary.monthlyExpenseTotal - financialSummary.monthlyLimit, 0)
        : 0;

    const availableAmount = financialSummary
        ? Math.max(financialSummary.monthlyLimit - financialSummary.monthlyExpenseTotal, 0)
        : 0;

    const statusMessage = isExceeded
        ? `Você ultrapassou o limite em ${formatMoney(exceededAmount)}`
        : `Você tem ${formatMoney(availableAmount)} disponível`;

    return (
        <div data-testid="dashboard-page">
            <header className={s.header}>
                <h1 className={s.greet}>Dashboard</h1>
                <p className={s.sub}>Resumo das suas finanças</p>
            </header>

            {shouldShowAlert && financialSummary && (
                <section
                    className={`${s.limitAlert} ${isExceeded ? s.limitAlertExceeded : s.limitAlertNear}`}
                    data-testid="financial-limit-alert"
                >
                    <div className={s.limitAlertIcon}>
                        {isExceeded ? <FaExclamationTriangle /> : <FaInfoCircle />}
                    </div>

                    <div className={s.limitAlertContent}>
                        <div className={s.limitAlertTitle}>Status do limite mensal</div>
                        <div className={s.limitAlertMessage}>{statusMessage}</div>

                        <div className={s.limitAlertStats}>
                            <span>Limite mensal: {formatMoney(financialSummary.monthlyLimit)}</span>
                            <span>Total gasto no mês: {formatMoney(financialSummary.monthlyExpenseTotal)}</span>
                            <span>Percentual utilizado: {financialSummary.percentageUsed.toFixed(2)}%</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={s.limitAlertClose}
                        data-testid="financial-limit-alert-close"
                        aria-label="Fechar alerta de limite"
                        onClick={dismissAlert}
                    >
                        <FaTimes />
                    </button>
                </section>
            )}

            {/* 📊 CARDS */}
            <div className={s.grid}>
                <div className={s.stat} data-testid="dashboard-income-card">
                    <div className={s.statLabel}>Receitas</div>
                    <div className={`${s.statValue} ${s.pos}`}>
                        R$ {income.toFixed(2)}
                    </div>
                    <div className={s.statSub}>
                        {transactions.filter(t => t.type === 'INCOME').length} lançamento(s)
                    </div>
                </div>

                <div className={s.stat} data-testid="dashboard-expense-card">
                    <div className={s.statLabel}>Despesas</div>
                    <div className={`${s.statValue} ${s.neg}`}>
                        R$ {expense.toFixed(2)}
                    </div>
                    <div className={s.statSub}>
                        {transactions.filter(t => t.type === 'EXPENSE').length} lançamento(s)
                    </div>
                </div>

                <div className={s.stat} data-testid="dashboard-balance-card">
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
            <section className={s.section} data-testid="dashboard-recent-transactions">
                <div className={s.sectionTitle}>
                    <span>Lançamentos recentes</span>
                </div>

                {transactions.length === 0 ? (
                    <div className={s.empty} data-testid="dashboard-empty">
                        Nenhum lançamento ainda.
                    </div>
                ) : (
                    transactions.slice(0, 6).map((t) => (
                        <div key={t.id} className={s.row} data-testid="dashboard-transaction-row">
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
