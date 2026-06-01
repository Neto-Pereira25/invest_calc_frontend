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

const COLORS = ['#9fb3c8', '#4f9bc8'];
const AXIS_COLOR = '#607187';
const GRID_COLOR = '#dbe5ef';

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
                                backgroundColor: '#ffffff',
                                border: '1px solid #dbe5ef',
                                color: '#213044',
                            }}
                            labelStyle={{ color: '#607187' }}
                            itemStyle={{ color: '#213044' }}
                        />
                        <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="52%"
                            outerRadius={110}
                            innerRadius={46}
                            stroke="#ffffff"
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
                                backgroundColor: '#ffffff',
                                border: '1px solid #dbe5ef',
                                color: '#213044',
                            }}
                            labelStyle={{ color: '#607187' }}
                            itemStyle={{ color: '#213044' }}
                        />
                        <Bar dataKey="invested" name="Total Investido" stackId="amount" fill="#9fb3c8" />
                        <Bar dataKey="totalInterest" name="Total Juros" stackId="amount" fill="#4f9bc8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
