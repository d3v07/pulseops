import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    trend?: number | null;
}

export function MetricCard({ title, value, subtitle, icon, trend }: MetricCardProps) {
    const getTrendDisplay = () => {
        if (trend === null || trend === undefined) return null;

        const isPositive = trend >= 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;

        return (
            <div className={`kpi-change ${isPositive ? 'positive' : 'negative'}`}>
                <TrendIcon size={16} />
                <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
        );
    };

    return (
        <div className="kpi-card">
            <div className="kpi-header">
                <span className="kpi-label">{title}</span>
                {icon && <div className="kpi-icon">{icon}</div>}
            </div>

            <div className="kpi-value">{value}</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {subtitle && (
                    <span style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)'
                    }}>
                        {subtitle}
                    </span>
                )}
                {getTrendDisplay()}
            </div>
        </div>
    );
}
