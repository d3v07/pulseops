import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricCard } from '../components/MetricCard';

describe('MetricCard', () => {
    it('renders title and value', () => {
        render(<MetricCard title="Total Events" value="1,234" />);

        expect(screen.getByText('Total Events')).toBeInTheDocument();
        expect(screen.getByText('1,234')).toBeInTheDocument();
    });

    it('displays subtitle when provided', () => {
        render(<MetricCard title="DAU" value="500" subtitle="Today" />);

        expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('shows positive trend in green', () => {
        render(<MetricCard title="Growth" value="100" trend={15.5} />);

        const trendElement = screen.getByText('+15.5%');
        expect(trendElement).toHaveClass('text-green-400');
    });

    it('shows negative trend in red', () => {
        render(<MetricCard title="Drop" value="50" trend={-10.2} />);

        const trendElement = screen.getByText('-10.2%');
        expect(trendElement).toHaveClass('text-red-400');
    });
});
