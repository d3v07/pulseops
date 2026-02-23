import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EventCountsChartProps {
    data: Array<{ eventName: string; count: number }>;
}

export function EventCountsChart({ data }: EventCountsChartProps) {
    const topTen = data.slice(0, 10);

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topTen} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                    type="number"
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                />
                <YAxis
                    type="category"
                    dataKey="eventName"
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                    width={120}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                />
                <Bar
                    dataKey="count"
                    fill="#8b5cf6"
                    radius={[0, 4, 4, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
