import { Head, Link, router, usePoll } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { EyeIcon, MessageCircleIcon, TrashIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Agent = { id: number; name: string };

type Conversation = {
    id: number;
    subject: string;
    status: string;
    channel: string;
    email: string | null;
    name: string | null;
    last_reply_at: string | null;
    created_at: string;
    messages_count: number;
    unread_messages_count: number;
    assigned_to: Agent | null;
};

type ConversationsData = {
    data: Conversation[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type StatusOption = { value: string; label: string; color: string };

type Props = {
    conversations: ConversationsData;
    filters: { search?: string; status?: string; assigned_to?: string };
    agents: Agent[];
    open_count: number;
    statuses: StatusOption[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Support', href: '/admin/support' },
];

const statusColors: Record<string, string> = {
    open: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    resolved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

function formatRelativeTime(dateStr: string | null): string {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function SupportIndex({ conversations, filters, agents, open_count, statuses }: Props) {
    // Refresh unread counts and new conversations every 30 seconds
    usePoll(30000);

    const columns: ColumnDef<Conversation>[] = [
        {
            accessorKey: 'subject',
            header: 'Subject',
            cell: ({ row }) => (
                <div className="flex items-start gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                        <MessageCircleIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate font-medium">{row.original.subject}</p>
                        <p className="truncate text-xs text-muted-foreground">
                            {row.original.name ?? row.original.email ?? '—'}
                        </p>
                    </div>
                    {row.original.unread_messages_count > 0 && (
                        <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                            {row.original.unread_messages_count}
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge className={statusColors[row.original.status] ?? ''}>
                    {statuses.find((s) => s.value === row.original.status)?.label ?? row.original.status}
                </Badge>
            ),
        },
        {
            accessorKey: 'assigned_to',
            header: 'Assigned to',
            cell: ({ row }) =>
                row.original.assigned_to ? (
                    <span className="text-sm">{row.original.assigned_to.name}</span>
                ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                ),
        },
        {
            accessorKey: 'messages_count',
            header: 'Messages',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">{row.original.messages_count}</span>
            ),
        },
        {
            accessorKey: 'last_reply_at',
            header: 'Last reply',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {formatRelativeTime(row.original.last_reply_at)}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/support/${row.original.id}`} prefetch cacheFor={60}>
                            <EyeIcon className="mr-1 h-3 w-3" />
                            View
                        </Link>
                    </Button>
                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        title="Delete Conversation"
                        description="This will permanently delete the conversation and all its messages."
                        onConfirm={() => {
                            router.delete(`/admin/support/${row.original.id}`, {
                                onSuccess: () => toast.success('Conversation deleted'),
                            });
                        }}
                    >
                        <TrashIcon className="h-3 w-3" />
                    </ConfirmButton>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Support" />
            <Wrapper>
                <PageHeader
                    title={`Support${open_count > 0 ? ` (${open_count} open)` : ''}`}
                    description="Manage customer support conversations"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href="/admin/support/canned-responses" prefetch cacheFor={30}>
                                Canned Responses
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={columns}
                    data={conversations.data}
                    pagination={{
                        current_page: conversations.current_page,
                        last_page: conversations.last_page,
                        per_page: conversations.per_page,
                        total: conversations.total,
                        prev_page_url: conversations.prev_page_url ?? null,
                        next_page_url: conversations.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder="Search by subject, email or name..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/support"
                />
            </Wrapper>
        </AppLayout>
    );
}
