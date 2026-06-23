import { useEffect, useState } from 'react';
import type { RepeatedExpenseState } from '../store/repeatedExpenseStore';
import { useRepeatedExpenseStore } from '../store/repeatedExpenseStore';
import type { RepeatedExpense } from '../types/repeatedExpense';
import s from './RepeatedExpensesPage.module.css';

export default function RepeatedExpensesPage() {
    const [showFrequencyInfo, setShowFrequencyInfo] = useState(false);
    const items = useRepeatedExpenseStore((state: RepeatedExpenseState) => state.items);
    const isLoading = useRepeatedExpenseStore((state: RepeatedExpenseState) => state.isLoading);
    const fetchRepeatedExpenses = useRepeatedExpenseStore(
        (state: RepeatedExpenseState) => state.fetchRepeatedExpenses
    );

    useEffect(() => {
        fetchRepeatedExpenses();
    }, [fetchRepeatedExpenses]);

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    return (
        <div className={s.page} data-testid="repeated-expenses-page">
            <header className={s.header}>
                <h1>Gastos Recorrentes</h1>
                <button
                    data-testid="repeated-expenses-info-toggle"
                    type="button"
                    className={s.infoButton}
                    onClick={() => setShowFrequencyInfo((prev) => !prev)}
                >
                    {showFrequencyInfo ? 'Ocultar explicação' : 'O que significa frequência?'}
                </button>
            </header>

            {showFrequencyInfo && (
                <section className={s.infoCard} data-testid="repeated-expenses-info-card">
                    <p>
                        A frequência representa em quantos meses diferentes esse gasto apareceu ao
                        menos uma vez.
                    </p>
                    <p>
                        Exemplo: frequência 3 significa que houve esse gasto em 3 meses, e não
                        necessariamente apenas 3 lançamentos no total.
                    </p>
                </section>
            )}

            {isLoading ? (
                <div className={s.loading} data-testid="repeated-expenses-loading">Carregando...</div>
            ) : items.length === 0 ? (
                <div className={s.empty} data-testid="repeated-expenses-empty">
                    <p>Nenhum gasto recorrente encontrado</p>
                </div>
            ) : (
                <div className={s.tableCard} data-testid="repeated-expenses-table-card">
                    <table className={s.table}>
                        <thead>
                            <tr>
                                <th>Descrição</th>
                                <th>Categoria</th>
                                <th>Subcategoria</th>
                                <th>Valor Médio</th>
                                <th>Frequência</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((expense: RepeatedExpense, index: number) => (
                                <tr key={index} data-testid="repeated-expense-row">
                                    <td>{expense.description}</td>
                                    <td>{expense.category}</td>
                                    <td>{expense.subcategory}</td>
                                    <td className={s.amount}>
                                        {formatCurrency(expense.averageAmount)}
                                    </td>
                                    <td>em {expense.frequency} mes(es)</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
