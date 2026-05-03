import { Table } from 'react-bootstrap';
import type { MonthlyBreakdown } from '../types/compoundInterestSimulation';
import styles from './CompoundInterestSimulationTable.module.css';

interface Props {
    data: MonthlyBreakdown[];
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
});

export default function CompoundInterestSimulationTable({ data }: Props) {
    if (!data.length) {
        return <div className={styles.empty}>Nenhum dado disponível para a tabela.</div>;
    }

    return (
        <div className={styles.tableWrap}>
            <Table bordered hover className={styles.table}>
                <thead>
                    <tr>
                        <th>Meses</th>
                        <th>Juros do Mês</th>
                        <th>Total Investido</th>
                        <th>Juros Acumulados</th>
                        <th>Acumulado</th>
                    </tr>
                </thead>

                <tbody>
                    {data.map((item) => (
                        <tr key={item.month}>
                            <td>{item.month}</td>

                            <td className={styles.interestColumn}>
                                {currencyFormatter.format(item.interest)}
                            </td>

                            <td>{currencyFormatter.format(item.invested)}</td>

                            <td className={styles.totalInterestColumn}>
                                {currencyFormatter.format(item.totalInterest)}
                            </td>

                            <td className={styles.totalColumn}>
                                {currencyFormatter.format(item.accumulated)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}