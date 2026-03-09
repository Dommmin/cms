import { useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Card } from '@/components/ui/card';

interface DataPoint {
    date: string;
    value: number;
    label?: string;
}

interface ChartWidgetProps {
    title: string;
    data: DataPoint[];
    chartType?: 'line' | 'donut';
    color?: string;
}

type Granularity = 'daily' | 'weekly' | 'monthly';

const GRANULARITY_OPTIONS: { label: string; value: Granularity }[] = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
];

const DONUT_COLORS = [
    '#3b82f6',
    '#22c55e',
    '#f59e0b',
    '#8b5cf6',
    '#ef4444',
    '#6b7280',
];

const colorMap: Record<string, string> = {
    blue: '#3b82f6',
    green: '#22c55e',
    purple: '#8b5cf6',
    orange: '#f59e0b',
    red: '#ef4444',
    indigo: '#6366f1',
};

function formatCurrency(value: number): string {
    if (value >= 100) {
        return `$${(value / 100).toFixed(0)}`;
    }
    return String(value);
}

function formatDate(isoDate: string): string {
    const d = new Date(isoDate + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function aggregateWeekly(data: DataPoint[]): DataPoint[] {
    const map = new Map<string, { total: number; label: string }>();
    for (const pt of data) {
        const d = new Date(pt.date + 'T00:00:00');
        // ISO week: Monday-based week start
        const day = d.getDay();
        const monday = new Date(d);
        monday.setDate(d.getDate() - ((day + 6) % 7));
        const key = monday.toISOString().slice(0, 10);
        const existing = map.get(key);
        if (existing) {
            existing.total += pt.value;
        } else {
            map.set(key, {
                total: pt.value,
                label: monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            });
        }
    }
    return Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-13)
        .map(([date, { total, label }]) => ({ date: label, value: total }));
}

function aggregateMonthly(data: DataPoint[]): DataPoint[] {
    const map = new Map<string, number>();
    for (const pt of data) {
        const key = pt.date.slice(0, 7); // YYYY-MM
        map.set(key, (map.get(key) ?? 0) + pt.value);
    }
    return Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([key, value]) => {
            const [year, month] = key.split('-');
            const d = new Date(Number(year), Number(month) - 1, 1);
            return {
                date: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                value,
            };
        });
}

export function ChartWidget({ title, data, chartType = 'line', color = 'blue' }: ChartWidgetProps) {
    const [granularity, setGranularity] = useState<Granularity>('daily');
    const stroke = colorMap[color] ?? colorMap.blue;

    const chartData = useMemo(() => {
        if (granularity === 'weekly') {
            return aggregateWeekly(data);
        }
        if (granularity === 'monthly') {
            return aggregateMonthly(data);
        }
        // Daily: last 30 data points, format ISO dates to "Jan 1"
        return data
            .slice(-30)
            .map((pt) => ({
                ...pt,
                date: pt.date.includes('-') ? formatDate(pt.date) : pt.date,
            }));
    }, [data, granularity]);

    if (chartType === 'donut') {
        return (
            <Card className="p-6">
                <h3 className="mb-4 font-semibold">{title}</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="label"
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                        >
                            {data.map((_, i) => (
                                <Cell
                                    key={i}
                                    fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter={((value: number, name: string) => [value, name]) as any}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
                    {data.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
                            />
                            {item.label ?? item.date}: {item.value}
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    const maxTicks = granularity === 'daily' ? 6 : granularity === 'weekly' ? 7 : chartData.length;
    const step = Math.max(1, Math.ceil(chartData.length / maxTicks));

    return (
        <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">{title}</h3>
                <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
                    {GRANULARITY_OPTIONS.map((o) => (
                        <button
                            key={o.value}
                            onClick={() => setGranularity(o.value)}
                            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                                granularity === o.value
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {o.label}
                        </button>
                    ))}
                </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <defs>
                        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={stroke} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={stroke} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                        interval={step - 1}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={formatCurrency}
                        width={48}
                    />
                    <Tooltip
                        contentStyle={{
                            background: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: 12,
                        }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={((v: number) => [formatCurrency(v), 'Revenue']) as any}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={stroke}
                        strokeWidth={2}
                        fill={`url(#grad-${color})`}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </Card>
    );
}
