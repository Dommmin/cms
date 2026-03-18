import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type AffiliateCode = {
    id: number;
    code: string;
    discount_type: 'percentage' | 'fixed' | 'none';
    discount_value: number;
    commission_rate: string;
    max_uses: number | null;
    uses_count: number;
    is_active: boolean;
    expires_at: string | null;
    referrals_count: number;
    referrals_sum_commission_amount: number | null;
    user: { id: number; name: string; email: string };
};

type CodesData = {
    data: AffiliateCode[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    codes: CodesData;
    filters: { search?: string; status?: string };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Affiliates', href: '/admin/affiliates/codes' },
    { title: 'Codes', href: '/admin/affiliates/codes' },
];

function formatDiscount(code: AffiliateCode): string {
    if (code.discount_type === 'percentage') return `${code.discount_value}%`;
    if (code.discount_type === 'fixed') return `${(code.discount_value / 100).toFixed(2)}`;
    return '—';
}

export default function CodesIndex({ codes, filters }: Props) {
    const columns: ColumnDef<AffiliateCode>[] = [
        {
            accessorKey: 'code',
            header: 'Code',
            cell: ({ row }) => (
                <div>
                    <p className="font-mono font-semibold">{row.original.code}</p>
                    <p className="text-xs text-muted-foreground">{row.original.user.name}</p>
                </div>
            ),
        },
        {
            accessorKey: 'discount_type',
            header: 'Discount',
            cell: ({ row }) => <span className="text-sm">{formatDiscount(row.original)}</span>,
        },
        {
            accessorKey: 'commission_rate',
            header: 'Commission',
            cell: ({ row }) => <span className="text-sm">{row.original.commission_rate}%</span>,
        },
        {
            accessorKey: 'uses_count',
            header: 'Uses',
            cell: ({ row }) => (
                <span className="text-sm">
                    {row.original.uses_count}
                    {row.original.max_uses ? ` / ${row.original.max_uses}` : ''}
                </span>
            ),
        },
        {
            accessorKey: 'referrals_sum_commission_amount',
            header: 'Total Commission',
            cell: ({ row }) => (
                <span className="text-sm font-medium">
                    {((row.original.referrals_sum_commission_amount ?? 0) / 100).toFixed(2)}
                </span>
            ),
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
                    {row.original.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/affiliates/codes/${row.original.id}/edit`} prefetch cacheFor={30}>
                            <PencilIcon className="mr-1 h-3 w-3" />
                            Edit
                        </Link>
                    </Button>
                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        title="Delete Code"
                        description="Delete this affiliate code? This cannot be undone."
                        onConfirm={() =>
                            router.delete(`/admin/affiliates/codes/${row.original.id}`, {
                                onSuccess: () => toast.success('Code deleted'),
                            })
                        }
                    >
                        <TrashIcon className="mr-1 h-3 w-3" />
                        Delete
                    </ConfirmButton>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Affiliate Codes" />
            <Wrapper>
                <PageHeader
                    title="Affiliate Codes"
                    description="Manage referral codes and track affiliate performance"
                >
                    <PageHeaderActions>
                        <Link href="/admin/affiliates/referrals">
                            <Button variant="outline">View Referrals</Button>
                        </Link>
                        <Link href="/admin/affiliates/codes/create">
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                New Code
                            </Button>
                        </Link>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={columns}
                    data={codes.data}
                    pagination={{
                        current_page: codes.current_page,
                        last_page: codes.last_page,
                        per_page: codes.per_page,
                        total: codes.total,
                        prev_page_url: codes.prev_page_url ?? null,
                        next_page_url: codes.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder="Search codes or affiliates..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/affiliates/codes"
                />
            </Wrapper>
        </AppLayout>
    );
}
