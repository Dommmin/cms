import { Head, Link, router } from '@inertiajs/react';
import * as AffiliateCodeController from '@/actions/App/Http/Controllers/Admin/AffiliateCodeController';
import * as ReferralController from '@/actions/App/Http/Controllers/Admin/ReferralController';
import type { ColumnDef } from '@tanstack/react-table';
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { AffiliateCode, IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Affiliates', href: AffiliateCodeController.index.url() },
    { title: 'Codes', href: AffiliateCodeController.index.url() },
];

function formatDiscount(code: AffiliateCode): string {
    if (code.discount_type === 'percentage') return `${code.discount_value}%`;
    if (code.discount_type === 'fixed')
        return `${(code.discount_value / 100).toFixed(2)}`;
    return '—';
}

export default function CodesIndex({ codes, filters }: IndexProps) {
    const __ = useTranslation();
    const columns: ColumnDef<AffiliateCode>[] = [
        {
            accessorKey: 'code',
            header: __('column.code', 'Code'),
            cell: ({ row }) => (
                <div>
                    <p className="font-mono font-semibold">
                        {row.original.code}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {row.original.user.name}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: 'discount_type',
            header: __('column.discount', 'Discount'),
            cell: ({ row }) => (
                <span className="text-sm">{formatDiscount(row.original)}</span>
            ),
        },
        {
            accessorKey: 'commission_rate',
            header: __('column.commission', 'Commission'),
            cell: ({ row }) => (
                <span className="text-sm">{row.original.commission_rate}%</span>
            ),
        },
        {
            accessorKey: 'uses_count',
            header: __('column.uses', 'Uses'),
            cell: ({ row }) => (
                <span className="text-sm">
                    {row.original.uses_count}
                    {row.original.max_uses ? ` / ${row.original.max_uses}` : ''}
                </span>
            ),
        },
        {
            accessorKey: 'referrals_sum_commission_amount',
            header: __('column.total', 'Total Commission'),
            cell: ({ row }) => (
                <span className="text-sm font-medium">
                    {(
                        (row.original.referrals_sum_commission_amount ?? 0) /
                        100
                    ).toFixed(2)}
                </span>
            ),
        },
        {
            accessorKey: 'is_active',
            header: __('column.status', 'Status'),
            cell: ({ row }) => (
                <Badge
                    variant={row.original.is_active ? 'default' : 'secondary'}
                >
                    {row.original.is_active
                        ? __('status.active', 'Active')
                        : __('status.inactive', 'Inactive')}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: __('column.actions', 'Actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={AffiliateCodeController.edit.url(row.original.id)}
                            prefetch
                            cacheFor={30}
                        >
                            <PencilIcon className="mr-1 h-3 w-3" />
                            {__('action.edit', 'Edit')}
                        </Link>
                    </Button>
                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        title={__('dialog.delete_title', 'Delete Code')}
                        description={__(
                            'dialog.cannot_be_undone',
                            'Delete this affiliate code? This cannot be undone.',
                        )}
                        onConfirm={() =>
                            router.delete(
                                AffiliateCodeController.destroy.url(row.original.id),
                                {
                                    onSuccess: () =>
                                        toast.success('Code deleted'),
                                },
                            )
                        }
                    >
                        <TrashIcon className="mr-1 h-3 w-3" />
                        {__('action.delete', 'Delete')}
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
                    title={__('page.affiliates', 'Affiliate Codes')}
                    description={__(
                        'page.affiliates_desc',
                        'Manage referral codes and track affiliate performance',
                    )}
                >
                    <PageHeaderActions>
                        <Link href={ReferralController.index.url()}>
                            <Button variant="outline">
                                {__('action.show', 'View Referrals')}
                            </Button>
                        </Link>
                        <Link href={AffiliateCodeController.create.url()}>
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {__('action.create', 'New Code')}
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
                    searchPlaceholder={__(
                        'placeholder.search',
                        'Search codes or affiliates...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl={AffiliateCodeController.index.url()}
                />
            </Wrapper>
        </AppLayout>
    );
}
