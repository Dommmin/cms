import { Head, Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { EyeIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import DataTable from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type CookieConsent = {
    id: number;
    session_id: string;
    ip: string;
    category: string;
    granted: boolean;
    created_at: string;
};

type ConsentsData = {
    data: CookieConsent[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    consents: ConsentsData;
    filters: { search?: string; category?: string; granted?: string };
    categories: string[];
    stats: {
        total_consents: number;
        granted_count: number;
        denied_count: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cookie Consents', href: '/admin/cookie-consents' },
];

export default function CookieConsentsIndex({
    consents,
    filters,
    categories: _categories,
    stats,
}: Props) {
    const __ = useTranslation();
    const columns: ColumnDef<CookieConsent>[] = [
        {
            accessorKey: 'session_id',
            header: __('column.session', 'Session'),
            cell: ({ row }) => (
                <span className="font-mono text-xs">
                    {row.original.session_id.slice(0, 12)}...
                </span>
            ),
        },
        {
            accessorKey: 'ip',
            header: __('column.ip', 'IP'),
            cell: ({ row }) => (
                <span className="font-mono text-sm">{row.original.ip}</span>
            ),
        },
        {
            accessorKey: 'category',
            header: __('column.category', 'Category'),
            cell: ({ row }) => (
                <Badge variant="outline" className="text-xs">
                    {row.original.category}
                </Badge>
            ),
        },
        {
            accessorKey: 'granted',
            header: __('column.status', 'Status'),
            cell: ({ row }) =>
                row.original.granted ? (
                    <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800"
                    >
                        <CheckCircleIcon className="mr-1 h-3 w-3" />
                        {__('status.granted', 'Granted')}
                    </Badge>
                ) : (
                    <Badge
                        variant="outline"
                        className="bg-red-100 text-red-800"
                    >
                        <XCircleIcon className="mr-1 h-3 w-3" />
                        {__('status.denied', 'Denied')}
                    </Badge>
                ),
        },
        {
            accessorKey: 'created_at',
            header: __('column.date', 'Date'),
            cell: ({ row }) => (
                <span className="text-sm">
                    {new Date(row.original.created_at).toLocaleString()}
                </span>
            ),
        },
        {
            id: 'actions',
            header: __('column.actions', 'Actions'),
            cell: ({ row }) => (
                <Link href={`/admin/cookie-consents/${row.original.id}`}>
                    <Button variant="outline" size="sm">
                        <EyeIcon className="mr-1 h-3 w-3" />
                        {__('action.show', 'View')}
                    </Button>
                </Link>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cookie Consents" />
            <Wrapper>
                <PageHeader
                    title={__('page.cookie_consents', 'Cookie Consents')}
                    description={__(
                        'page.cookie_consents_desc',
                        'Manage and view cookie consent records',
                    )}
                />

                {/* Stats */}
                <div className="mb-6 grid grid-cols-3 gap-4">
                    <div className="rounded-lg border bg-card p-4">
                        <div className="text-sm text-muted-foreground">
                            {__('misc.total', 'Total')}
                        </div>
                        <div className="text-2xl font-bold">
                            {stats.total_consents}
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="text-sm text-muted-foreground">
                            {__('status.granted', 'Granted')}
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                            {stats.granted_count}
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="text-sm text-muted-foreground">
                            {__('status.denied', 'Denied')}
                        </div>
                        <div className="text-2xl font-bold text-red-600">
                            {stats.denied_count}
                        </div>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={consents.data}
                    pagination={{
                        current_page: consents.current_page,
                        last_page: consents.last_page,
                        per_page: consents.per_page,
                        total: consents.total,
                        prev_page_url: consents.prev_page_url ?? null,
                        next_page_url: consents.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder={__(
                        'placeholder.search',
                        'Search by session or IP...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/cookie-consents"
                />
            </Wrapper>
        </AppLayout>
    );
}
