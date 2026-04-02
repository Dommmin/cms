import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    CopyIcon,
    EyeIcon,
    PencilIcon,
    PlusIcon,
    SendIcon,
    TrashIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as NewsletterCampaignController from '@/actions/App/Http/Controllers/Admin/NewsletterCampaignController';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Campaign, IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Newsletter', href: NewsletterCampaignController.index.url() },
    { title: 'Campaigns', href: NewsletterCampaignController.index.url() },
];

const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-blue-100 text-blue-800',
    sending: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function CampaignsIndex({ campaigns, filters }: IndexProps) {
    const __ = useTranslation();
    const columns: ColumnDef<Campaign>[] = [
        {
            accessorKey: 'name',
            header: __('column.name', 'Name'),
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
            header: __('column.segment', 'Segment'),
            cell: ({ row }) =>
                row.original.segment ? (
                    <span className="text-sm">{row.original.segment.name}</span>
                ) : (
                    <span className="text-muted-foreground">
                        {__('misc.all_subscribers', 'All subscribers')}
                    </span>
                ),
        },
        {
            accessorKey: 'type',
            header: __('column.type', 'Type'),
            cell: ({ row }) => (
                <Badge variant="outline" className="text-xs">
                    {row.original.type}
                </Badge>
            ),
        },
        {
            accessorKey: 'status',
            header: __('column.status', 'Status'),
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
            header: __('column.sent', 'Sent'),
            cell: ({ row }) => (
                <span className="text-sm">{row.original.total_sent}</span>
            ),
        },
        {
            accessorKey: 'scheduled_at',
            header: __('column.scheduled_at', 'Scheduled'),
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
            header: __('column.actions', 'Actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={NewsletterCampaignController.edit.url(
                                row.original.id,
                            )}
                            prefetch
                            cacheFor={60}
                        >
                            <EyeIcon className="mr-1 h-3 w-3" />
                            {__('action.show', 'View')}
                        </Link>
                    </Button>
                    {row.original.status === 'draft' && (
                        <>
                            <Button asChild variant="outline" size="sm">
                                <Link
                                    href={NewsletterCampaignController.edit.url(
                                        row.original.id,
                                    )}
                                    prefetch
                                    cacheFor={30}
                                >
                                    <PencilIcon className="mr-1 h-3 w-3" />
                                    {__('action.edit', 'Edit')}
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    router.post(
                                        NewsletterCampaignController.send.url(
                                            row.original.id,
                                        ),
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
                                NewsletterCampaignController.duplicate.url(
                                    row.original.id,
                                ),
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
                        title={__('dialog.delete_title', 'Delete Campaign')}
                        description={`Are you sure you want to delete "${row.original.name}"?`}
                        onConfirm={() => {
                            router.delete(
                                NewsletterCampaignController.destroy.url(
                                    row.original.id,
                                ),
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
                    title={__('page.campaigns', 'Campaigns')}
                    description={__(
                        'page.campaigns_desc',
                        'Manage email campaigns',
                    )}
                >
                    <PageHeaderActions>
                        <Link href={NewsletterCampaignController.create.url()}>
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                {__('action.create', 'Create Campaign')}
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
                    searchPlaceholder={__(
                        'placeholder.search',
                        'Search campaigns...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl={NewsletterCampaignController.index.url()}
                />
            </Wrapper>
        </AppLayout>
    );
}
