import { Table } from 'react-bootstrap';
import type { MonthlyBreakdown } from '../types/compoundInterestSimulation';

interface Props {
    data: MonthlyBreakdown[];
}

export default function CompoundInterestSimulationTable({ data }: Props) {
    return (
        <div style={{ overflowX: 'auto' }}>
            <Table
                striped
                bordered
                hover
                variant="dark"
                style={{ marginTop: '20px' }}
            >
                <thead>
                    <tr>
                        <th>Mês</th>
                        <th>Total Investido</th>
                        <th>Juros do Mês</th>
                        <th>Juros Acumulados</th>
                        <th>Total</th>
                    </tr>
                </thead>

                <tbody>
                    {data.map((item) => (
                        <tr key={item.month}>
                            <td>{item.month}</td>

                            <td>
                                R$ {item.invested.toFixed(2)}
                            </td>

                            <td style={{ color: '#00ff9d' }}>
                                R$ {item.interest.toFixed(2)}
                            </td>

                            <td style={{ color: '#00c3ff' }}>
                                R$ {item.totalInterest.toFixed(2)}
                            </td>

                            <td style={{ fontWeight: 600 }}>
                                R$ {item.accumulated.toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}