import {
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type { MonthlyBreakdown } from '../types/compoundInterestSimulation';

interface Props {
    data: MonthlyBreakdown[];
}

export default function CompoundInterestSimulationChart({ data }: Props) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="accumulated" stroke="#00ff9d" />
            </LineChart>
        </ResponsiveContainer>
    );
}