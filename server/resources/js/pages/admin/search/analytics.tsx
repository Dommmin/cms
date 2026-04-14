import { Head, router } from '@inertiajs/react';
import { SearchIcon } from 'lucide-react';
import * as SearchAnalyticsController from '@/actions/App/Http/Controllers/Admin/SearchAnalyticsController';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { AnalyticsProps } from './analytics.types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Search Analytics', href: '' }];

const PERIOD_OPTIONS = [
    { label: '7 days', value: 7 },
    { label: '30 days', value: 30 },
    { label: '90 days', value: 90 },
];

export default function SearchAnalytics({
    topQueries,
    zeroResults,
    dailyVolume,
    stats,
    days,
}: AnalyticsProps) {
    function changePeriod(newDays: number) {
        router.get(
            SearchAnalyticsController.index.url({ query: { days: newDays } }),
            {},
            { preserveState: false },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Search Analytics" />
            <Wrapper>
                <PageHeader
                    title="Search Analytics"
                    description="Insights into what visitors are searching for."
                >
                    <div className="flex items-center gap-2">
                        {PERIOD_OPTIONS.map((opt) => (
                            <Button
                                key={opt.value}
                                variant={
                                    days === opt.value ? 'default' : 'outline'
                                }
                                size="sm"
                                onClick={() => changePeriod(opt.value)}
                            >
                                {opt.label}
                            </Button>
                        ))}
                    </div>
                </PageHeader>

                {/* Stat cards */}
                <div className="mb-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border bg-card p-5">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Total Searches
                        </p>
                        <p className="mt-2 text-3xl font-bold">
                            {stats.total_searches.toLocaleString()}
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card p-5">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Unique Queries
                        </p>
                        <p className="mt-2 text-3xl font-bold">
                            {stats.unique_queries.toLocaleString()}
                        </p>
                    </div>
                    <div className="rounded-xl border bg-card p-5">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Zero-result Rate
                        </p>
                        <p className="mt-2 text-3xl font-bold">
                            {stats.zero_result_rate}%
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Top searches */}
                    <div className="rounded-xl border">
                        <div className="border-b px-4 py-3">
                            <h2 className="font-semibold">Top Searches</h2>
                            <p className="text-xs text-muted-foreground">
                                Most frequent queries (last {days} days)
                            </p>
                        </div>
                        {topQueries.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 p-10 text-center text-muted-foreground">
                                <SearchIcon className="h-8 w-8 opacity-30" />
                                <p className="text-sm">
                                    No searches recorded yet.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                                #
                                            </th>
                                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                                Query
                                            </th>
                                            <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                                                Count
                                            </th>
                                            <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                                                Avg Results
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topQueries.map((row, index) => (
                                            <tr
                                                key={row.query}
                                                className="border-b last:border-0 hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-2 text-muted-foreground">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-2 font-medium">
                                                    {row.query}
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    {row.count}
                                                </td>
                                                <td className="px-4 py-2 text-right text-muted-foreground">
                                                    {row.avg_results}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Zero-result queries */}
                    <div className="rounded-xl border">
                        <div className="border-b px-4 py-3">
                            <h2 className="font-semibold">No Results Found</h2>
                            <p className="text-xs text-muted-foreground">
                                Queries returning 0 products — potential gaps in
                                catalogue
                            </p>
                        </div>
                        {zeroResults.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 p-10 text-center text-muted-foreground">
                                <SearchIcon className="h-8 w-8 opacity-30" />
                                <p className="text-sm">
                                    No zero-result queries.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                                Query
                                            </th>
                                            <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                                                Count
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {zeroResults.map((row) => (
                                            <tr
                                                key={row.query}
                                                className="border-b last:border-0 hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-300"
                                                    >
                                                        {row.query}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-2 text-right font-medium">
                                                    {row.count}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Daily volume */}
                <div className="mt-6 rounded-xl border">
                    <div className="border-b px-4 py-3">
                        <h2 className="font-semibold">Daily Search Volume</h2>
                        <p className="text-xs text-muted-foreground">
                            Number of searches per day (last {days} days)
                        </p>
                    </div>
                    {dailyVolume.length === 0 ? (
                        <div className="p-10 text-center text-sm text-muted-foreground">
                            No data for the selected period.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            Date
                                        </th>
                                        <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                                            Searches
                                        </th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">
                                            Volume
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const maxCount = Math.max(
                                            ...dailyVolume.map((d) => d.count),
                                            1,
                                        );
                                        return dailyVolume.map((row) => (
                                            <tr
                                                key={row.date}
                                                className="border-b last:border-0 hover:bg-muted/30"
                                            >
                                                <td className="px-4 py-2 text-muted-foreground">
                                                    {row.date}
                                                </td>
                                                <td className="px-4 py-2 text-right font-medium">
                                                    {row.count}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className="h-full rounded-full bg-primary"
                                                            style={{
                                                                width: `${Math.round((row.count / maxCount) * 100)}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ));
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Wrapper>
        </AppLayout>
    );
}
