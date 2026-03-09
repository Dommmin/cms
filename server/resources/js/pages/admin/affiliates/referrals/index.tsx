import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Referral = {
    id: number;
    status: 'pending' | 'approved' | 'paid' | 'cancelled';
    order_total: number;
    commission_amount: number;
    paid_at: string | null;
    created_at: string;
    affiliate_code: {
        id: number;
        code: string;
        user: { id: number; name: string; email: string };
    };
    order: { id: number; reference_number: string; total: number; status: string } | null;
    referred_user: { id: number; name: string; email: string } | null;
};

type ReferralsData = {
    data: Referral[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Stats = {
    total_referrals: number;
    pending_commissions: number;
    approved_commissions: number;
    paid_commissions: number;
};

type Props = {
    referrals: ReferralsData;
    stats: Stats;
    filters: { search?: string; status?: string };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Affiliates', href: '/admin/affiliates/codes' },
    { title: 'Referrals', href: '/admin/affiliates/referrals' },
];

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'outline',
    approved: 'default',
    paid: 'secondary',
    cancelled: 'destructive',
};

function fmt(cents: number): string {
    return (cents / 100).toFixed(2);
}

export default function ReferralsIndex({ referrals, stats, filters }: Props) {
    const columns: ColumnDef<Referral>[] = [
        {
            accessorKey: 'affiliate_code',
            header: 'Affiliate',
            cell: ({ row }) => (
                <div>
                    <p className="font-mono font-semibold">{row.original.affiliate_code.code}</p>
                    <p className="text-xs text-muted-foreground">
                        {row.original.affiliate_code.user.name}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: 'referred_user',
            header: 'Customer',
            cell: ({ row }) =>
                row.original.referred_user ? (
                    <div>
                        <p className="text-sm font-medium">{row.original.referred_user.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {row.original.referred_user.email}
                        </p>
                    </div>
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        {
            accessorKey: 'order',
            header: 'Order',
            cell: ({ row }) =>
                row.original.order ? (
                    <Link
                        href={`/admin/ecommerce/orders/${row.original.order.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                    >
                        #{row.original.order.reference_number}
                    </Link>
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        {
            accessorKey: 'order_total',
            header: 'Order Total',
            cell: ({ row }) => <span className="text-sm">{fmt(row.original.order_total)}</span>,
        },
        {
            accessorKey: 'commission_amount',
            header: 'Commission',
            cell: ({ row }) => (
                <span className="text-sm font-semibold text-green-600">
                    {fmt(row.original.commission_amount)}
                </span>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant={STATUS_VARIANT[row.original.status] ?? 'outline'}>
                    {row.original.status}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const r = row.original;
                return (
                    <div className="flex items-center gap-2">
                        {r.status === 'pending' && (
                            <ConfirmButton
                                variant="default"
                                size="sm"
                                title="Approve Referral"
                                description="Approve this referral and mark the commission as ready to pay?"
                                onConfirm={() =>
                                    router.post(
                                        `/admin/affiliates/referrals/${r.id}/approve`,
                                        {},
                                        { onSuccess: () => toast.success('Referral approved') },
                                    )
                                }
                            >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Approve
                            </ConfirmButton>
                        )}
                        {r.status === 'approved' && (
                            <ConfirmButton
                                variant="default"
                                size="sm"
                                title="Mark as Paid"
                                description={`Mark commission of ${fmt(r.commission_amount)} as paid to ${r.affiliate_code.user.name}?`}
                                onConfirm={() =>
                                    router.post(
                                        `/admin/affiliates/referrals/${r.id}/mark-paid`,
                                        {},
                                        { onSuccess: () => toast.success('Marked as paid') },
                                    )
                                }
                            >
                                Mark Paid
                            </ConfirmButton>
                        )}
                        {['pending', 'approved'].includes(r.status) && (
                            <ConfirmButton
                                variant="destructive"
                                size="sm"
                                title="Cancel Referral"
                                description="Cancel this referral? The commission will not be paid."
                                onConfirm={() =>
                                    router.post(
                                        `/admin/affiliates/referrals/${r.id}/cancel`,
                                        {},
                                        { onSuccess: () => toast.success('Referral cancelled') },
                                    )
                                }
                            >
                                <XCircle className="mr-1 h-3 w-3" />
                                Cancel
                            </ConfirmButton>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Referrals" />
            <Wrapper>
                <PageHeader
                    title="Referral Tracking"
                    description="Monitor commissions and payout status"
                >
                    <PageHeaderActions>
                        <Link href="/admin/affiliates/codes">
                            <Button variant="outline">Manage Codes</Button>
                        </Link>
                    </PageHeaderActions>
                </PageHeader>

                {/* Stats */}
                <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Referrals
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{stats.total_referrals}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Pending Commission
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-yellow-600">
                                {fmt(stats.pending_commissions)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Approved Commission
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-blue-600">
                                {fmt(stats.approved_commissions)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Paid Commission
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-600">
                                {fmt(stats.paid_commissions)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <DataTable
                    columns={columns}
                    data={referrals.data}
                    pagination={{
                        current_page: referrals.current_page,
                        last_page: referrals.last_page,
                        per_page: referrals.per_page,
                        total: referrals.total,
                        prev_page_url: referrals.prev_page_url ?? null,
                        next_page_url: referrals.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder="Search by code..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/affiliates/referrals"
                />
            </Wrapper>
        </AppLayout>
    );
}
