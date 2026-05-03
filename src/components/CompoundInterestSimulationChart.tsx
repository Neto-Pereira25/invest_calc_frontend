import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type { MonthlyBreakdown } from '../types/compoundInterestSimulation';
import styles from './CompoundInterestSimulationChart.module.css';

interface Props {
    data: MonthlyBreakdown[];
    totalInvested?: number;
    totalInterest?: number;
}

const COLORS = ['#334155', '#4cc9ff'];
const AXIS_COLOR = '#94a3b8';
const GRID_COLOR = '#334155';

const axisCurrencyFormatter = (value: number) => {
    if (value >= 1000) {
        return `R$ ${(value / 1000).toFixed(2)} K`;
    }

    return `R$ ${value.toFixed(2)}`;
};

const tooltipValueFormatter = (value: number | string | ReadonlyArray<number | string> | undefined) => {
    const sourceValue = Array.isArray(value) ? value[0] : value;
    const numericValue = typeof sourceValue === 'number' ? sourceValue : Number(sourceValue ?? 0);
    return axisCurrencyFormatter(Number.isFinite(numericValue) ? numericValue : 0);
};

export default function CompoundInterestSimulationChart({ data, totalInvested = 0, totalInterest = 0 }: Props) {
    if (!data.length) {
        return <div className={styles.empty}>Nenhum dado disponível para o gráfico.</div>;
    }

    const pieData = [
        { name: 'Total Investido', value: totalInvested },
        { name: 'Total Juros', value: totalInterest },
    ];

    return (
        <div className={styles.wrapper}>
            <div className={styles.pieArea}>
                <ResponsiveContainer width="100%" height={340}>
                    <PieChart>
                        <Legend
                            verticalAlign="top"
                            height={40}
                            iconType="rect"
                            wrapperStyle={{ color: AXIS_COLOR }}
                        />
                        <Tooltip
                            formatter={tooltipValueFormatter}
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                color: '#e2e8f0',
                            }}
                            labelStyle={{ color: '#94a3b8' }}
                            itemStyle={{ color: '#e2e8f0' }}
                        />
                        <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="52%"
                            outerRadius={110}
                            innerRadius={46}
                            stroke="#1e293b"
                            strokeWidth={4}
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className={styles.barArea}>
                <ResponsiveContainer width="100%" height={360}>
                    <BarChart data={data} margin={{ top: 14, right: 18, left: 0, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="0" stroke={GRID_COLOR} />
                        <XAxis
                            dataKey="month"
                            tick={{ fill: AXIS_COLOR }}
                            axisLine={{ stroke: GRID_COLOR }}
                            tickLine={{ stroke: GRID_COLOR }}
                            label={{ value: 'Meses', position: 'insideBottom', offset: -5, fill: AXIS_COLOR }}
                        />
                        <YAxis
                            tickFormatter={axisCurrencyFormatter}
                            tick={{ fill: AXIS_COLOR }}
                            axisLine={{ stroke: GRID_COLOR }}
                            tickLine={{ stroke: GRID_COLOR }}
                            width={118}
                        />
                        <Tooltip
                            formatter={tooltipValueFormatter}
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                color: '#e2e8f0',
                            }}
                            labelStyle={{ color: '#94a3b8' }}
                            itemStyle={{ color: '#e2e8f0' }}
                        />
                        <Bar dataKey="invested" name="Total Investido" stackId="amount" fill="#334155" />
                        <Bar dataKey="totalInterest" name="Total Juros" stackId="amount" fill="#4cc9ff" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}