import { Head, Link } from '@inertiajs/react';
import { DownloadIcon, FileSpreadsheetIcon, FileTextIcon, PencilIcon } from 'lucide-react';
import * as CustomReportController from '@/actions/App/Http/Controllers/Admin/CustomReportController';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { ShowProps } from './show.types';

const DATA_SOURCE_LABELS: Record<string, string> = {
    orders: 'Orders',
    products: 'Products',
    customers: 'Customers',
};

export default function ShowReport({ report, results }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Reports', href: CustomReportController.index.url() },
        { title: report.name, href: '' },
    ];

    const hasSummary = Object.keys(results.summary).length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={report.name} />
            <Wrapper>
                <PageHeader
                    title={report.name}
                    description={
                        report.description ??
                        `${DATA_SOURCE_LABELS[report.data_source] ?? report.data_source} report`
                    }
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <a
                                href={CustomReportController.exportMethod.url(
                                    report.id,
                                )}
                            >
                                <DownloadIcon className="mr-2 h-4 w-4" />
                                Export CSV
                            </a>
                        </Button>
                        <Button asChild variant="outline">
                            <a
                                href={CustomReportController.exportExcel.url(
                                    report.id,
                                )}
                            >
                                <FileSpreadsheetIcon className="mr-2 h-4 w-4" />
                                Export Excel
                            </a>
                        </Button>
                        <Button asChild variant="outline">
                            <a
                                href={CustomReportController.exportPdf.url(
                                    report.id,
                                )}
                            >
                                <FileTextIcon className="mr-2 h-4 w-4" />
                                Export PDF
                            </a>
                        </Button>
                        <Button asChild>
                            <Link
                                href={CustomReportController.edit.url(
                                    report.id,
                                )}
                            >
                                <PencilIcon className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                {/* Report meta */}
                <div className="mb-6 flex flex-wrap gap-2">
                    <Badge variant="secondary">
                        {DATA_SOURCE_LABELS[report.data_source] ??
                            report.data_source}
                    </Badge>
                    {report.chart_type && (
                        <Badge variant="outline">{report.chart_type}</Badge>
                    )}
                    {report.is_public && (
                        <Badge variant="default">Public</Badge>
                    )}
                    {report.metrics.map((m) => (
                        <Badge key={m} variant="outline">
                            {m}
                        </Badge>
                    ))}
                </div>

                {/* Summary cards */}
                {hasSummary && (
                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {Object.entries(results.summary).map(([key, value]) => (
                            <div
                                key={key}
                                className="rounded-xl border bg-card p-4"
                            >
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    {key.replace(/_/g, ' ')}
                                </p>
                                <p className="mt-1 text-2xl font-bold">
                                    {String(value)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Chart placeholder for non-table chart types */}
                {report.chart_type && report.chart_type !== 'table' && (
                    <div className="mb-6 flex items-center justify-center rounded-xl border bg-muted/30 p-12">
                        <p className="text-sm text-muted-foreground">
                            Chart visualization coming soon — data available in
                            the table below.
                        </p>
                    </div>
                )}

                {/* Results table */}
                {results.data.length === 0 ? (
                    <div className="rounded-xl border bg-muted/30 p-12 text-center">
                        <p className="text-sm text-muted-foreground">
                            No data found for this report configuration.
                        </p>
                    </div>
                ) : (
                    <div className="rounded-xl border">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        {results.columns.map((col) => (
                                            <th
                                                key={col}
                                                className="px-4 py-3 text-left font-medium text-muted-foreground"
                                            >
                                                {col.replace(/_/g, ' ')}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.data.map((row, rowIndex) => (
                                        <tr
                                            key={rowIndex}
                                            className="border-b last:border-0 hover:bg-muted/30"
                                        >
                                            {results.columns.map((col) => (
                                                <td
                                                    key={col}
                                                    className="px-4 py-3"
                                                >
                                                    {row[col] !== null &&
                                                    row[col] !== undefined
                                                        ? String(row[col])
                                                        : '—'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
                            {results.data.length} row
                            {results.data.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                )}
            </Wrapper>
        </AppLayout>
    );
}
