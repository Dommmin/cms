import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    Megaphone,
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    CopyIcon,
    SendIcon,
    ClockIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Segment = {
    id: number;
    name: string;
};

type Campaign = {
    id: number;
    name: string;
    subject: string;
    status: string;
    type: string;
    segment?: Segment | null;
    total_sent: number;
    scheduled_at: string | null;
    created_at: string;
};

type CampaignsData = {
    data: Campaign[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    campaigns: CampaignsData;
    filters: { search?: string; status?: string; type?: string };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Newsletter', href: '/admin/newsletter' },
    { title: 'Campaigns', href: '/admin/newsletter/campaigns' },
];

const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-blue-100 text-blue-800',
    sending: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function CampaignsIndex({ campaigns, filters }: Props) {
    const columns: ColumnDef<Campaign>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.name}</div>
                    <div className="text-xs text-muted-foreground">
                        {row.original.subject}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'segment',
            header: 'Segment',
            cell: ({ row }) =>
                row.original.segment ? (
                    <span className="text-sm">{row.original.segment.name}</span>
                ) : (
                    <span className="text-muted-foreground">
                        All subscribers
                    </span>
                ),
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => (
                <Badge variant="outline" className="text-xs">
                    {row.original.type}
                </Badge>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    className={
                        statusColors[row.original.status] ||
                        'bg-gray-100 text-gray-800'
                    }
                >
                    {row.original.status}
                </Badge>
            ),
        },
        {
            accessorKey: 'total_sent',
            header: 'Sent',
            cell: ({ row }) => (
                <span className="text-sm">{row.original.total_sent}</span>
            ),
        },
        {
            accessorKey: 'scheduled_at',
            header: 'Scheduled',
            cell: ({ row }) =>
                row.original.scheduled_at ? (
                    <span className="text-sm">
                        {new Date(row.original.scheduled_at).toLocaleString()}
                    </span>
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/newsletter/campaigns/${row.original.id}`} prefetch cacheFor={60}>
                            <EyeIcon className="mr-1 h-3 w-3" />
                            View
                        </Link>
                    </Button>
                    {row.original.status === 'draft' && (
                        <>
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/newsletter/campaigns/${row.original.id}/edit`} prefetch cacheFor={30}>
                                    <PencilIcon className="mr-1 h-3 w-3" />
                                    Edit
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    router.post(
                                        `/admin/newsletter/campaigns/${row.original.id}/send`,
                                        {},
                                        {
                                            onSuccess: () =>
                                                toast.success(
                                                    'Campaign sending started',
                                                ),
                                        },
                                    );
                                }}
                            >
                                <SendIcon className="mr-1 h-3 w-3" />
                            </Button>
                        </>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            router.post(
                                `/admin/newsletter/campaigns/${row.original.id}/duplicate`,
                                {},
                                {
                                    onSuccess: () =>
                                        toast.success('Campaign duplicated'),
                                },
                            );
                        }}
                    >
                        <CopyIcon className="mr-1 h-3 w-3" />
                    </Button>
                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        title="Delete Campaign"
                        description={`Are you sure you want to delete "${row.original.name}"?`}
                        onConfirm={() => {
                            router.delete(
                                `/admin/newsletter/campaigns/${row.original.id}`,
                                {
                                    onSuccess: () =>
                                        toast.success('Campaign deleted'),
                                },
                            );
                        }}
                    >
                        <TrashIcon className="mr-1 h-3 w-3" />
                    </ConfirmButton>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Newsletter Campaigns" />
            <Wrapper>
                <PageHeader
                    title="Campaigns"
                    description="Manage email campaigns"
                >
                    <PageHeaderActions>
                        <Link href="/admin/newsletter/campaigns/create">
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Create Campaign
                            </Button>
                        </Link>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={columns}
                    data={campaigns.data}
                    pagination={{
                        current_page: campaigns.current_page,
                        last_page: campaigns.last_page,
                        per_page: campaigns.per_page,
                        total: campaigns.total,
                        prev_page_url: campaigns.prev_page_url ?? null,
                        next_page_url: campaigns.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder="Search campaigns..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/newsletter/campaigns"
                />
            </Wrapper>
        </AppLayout>
    );
}
