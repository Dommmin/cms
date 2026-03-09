import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    HelpCircle,
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
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

type Faq = {
    id: number;
    question: string;
    answer: string;
    category: string | null;
    is_active: boolean;
    position: number;
    views_count: number;
    helpful_count: number;
    created_at: string;
};

type FaqsData = {
    data: Faq[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    faqs: FaqsData;
    filters: { search?: string; category?: string; is_active?: string };
    categories: string[];
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'FAQ', href: '/admin/faqs' }];

export default function FaqsIndex({ faqs, filters, categories }: Props) {
    const columns: ColumnDef<Faq>[] = [
        {
            accessorKey: 'question',
            header: 'Question',
            cell: ({ row }) => (
                <div className="max-w-md">
                    <p className="line-clamp-2 font-medium">
                        {row.original.question}
                    </p>
                    {row.original.category && (
                        <Badge variant="outline" className="mt-1 text-xs">
                            {row.original.category}
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    variant={row.original.is_active ? 'default' : 'secondary'}
                >
                    {row.original.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            accessorKey: 'position',
            header: 'Position',
            cell: ({ row }) => (
                <span className="text-sm">{row.original.position}</span>
            ),
        },
        {
            accessorKey: 'views_count',
            header: 'Views',
            cell: ({ row }) => (
                <span className="text-sm">{row.original.views_count}</span>
            ),
        },
        {
            accessorKey: 'helpful_count',
            header: 'Helpful',
            cell: ({ row }) => (
                <span className="text-sm">{row.original.helpful_count}</span>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Link href={`/admin/faqs/${row.original.id}/edit`}>
                        <Button variant="outline" size="sm">
                            <PencilIcon className="mr-1 h-3 w-3" />
                            Edit
                        </Button>
                    </Link>
                    <ConfirmButton
                        variant="destructive"
                        size="sm"
                        title="Delete FAQ"
                        description={`Are you sure you want to delete this FAQ? This action cannot be undone.`}
                        onConfirm={() => {
                            router.delete(`/admin/faqs/${row.original.id}`, {
                                onSuccess: () => toast.success('FAQ deleted'),
                            });
                        }}
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
            <Head title="FAQ" />
            <Wrapper>
                <PageHeader
                    title="FAQ"
                    description="Manage frequently asked questions"
                >
                    <PageHeaderActions>
                        <Link href="/admin/faqs/create">
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Add FAQ
                            </Button>
                        </Link>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={columns}
                    data={faqs.data}
                    pagination={{
                        current_page: faqs.current_page,
                        last_page: faqs.last_page,
                        per_page: faqs.per_page,
                        total: faqs.total,
                        prev_page_url: faqs.prev_page_url ?? null,
                        next_page_url: faqs.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder="Search questions..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/faqs"
                />
            </Wrapper>
        </AppLayout>
    );
}
