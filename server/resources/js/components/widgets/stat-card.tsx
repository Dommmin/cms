import * as icons from 'lucide-react';
import { ArrowDown, ArrowUp, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { StatCardProps } from './stat-card.types';

const colorClasses = {
    blue: 'text-blue-500 bg-blue-50 dark:bg-blue-950',
    green: 'text-green-500 bg-green-50 dark:bg-green-950',
    purple: 'text-purple-500 bg-purple-50 dark:bg-purple-950',
    orange: 'text-orange-500 bg-orange-50 dark:bg-orange-950',
    red: 'text-red-500 bg-red-50 dark:bg-red-950',
    yellow: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950',
    gray: 'text-gray-500 bg-gray-50 dark:bg-gray-950',
    indigo: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950',
};

export function StatCard({
    title,
    value,
    trend,
    icon = 'activity',
    color = 'blue',
    format = 'number',
}: StatCardProps) {
    const Icon =
        (icons as unknown as Record<string, LucideIcon>)[
            icon
                .split('-')
                .map((word, i) =>
                    i === 0
                        ? word
                        : word.charAt(0).toUpperCase() + word.slice(1),
                )
                .join('')
        ] || icons.Activity;

    const formattedValue =
        format === 'currency'
            ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
              }).format(Number(value))
            : new Intl.NumberFormat('en-US').format(Number(value));

    const trendColor = trend && trend > 0 ? 'text-green-600' : 'text-red-600';
    const TrendIcon = trend && trend > 0 ? ArrowUp : ArrowDown;

    return (
        <Card className="p-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                        {title}
                    </p>
                    <p className="mt-2 text-3xl font-bold">{formattedValue}</p>
                    {trend !== undefined && trend !== 0 && (
                        <div className="mt-2 flex items-center gap-1 text-sm">
                            <TrendIcon className={cn('h-4 w-4', trendColor)} />
                            <span className={trendColor}>
                                {Math.abs(trend)}%
                            </span>
                            <span className="text-muted-foreground">
                                vs last period
                            </span>
                        </div>
                    )}
                </div>
                <div
                    className={cn(
                        'rounded-lg p-3',
                        colorClasses[color as keyof typeof colorClasses] ||
                            colorClasses.blue,
                    )}
                >
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </Card>
    );
}
