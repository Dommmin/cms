import { Head, Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { PencilIcon } from 'lucide-react';
import * as EmailTemplateController from '@/actions/App/Http/Controllers/Admin/Ecommerce/EmailTemplateController';
import DataTable from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { EmailTemplate, IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Email Templates',
        href: EmailTemplateController.index.url(),
    },
];

export default function EmailTemplatesIndex({ templates }: IndexProps) {
    const columns: ColumnDef<EmailTemplate>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => (
                <div className="font-medium">{row.original.name}</div>
            ),
        },
        {
            accessorKey: 'key',
            header: 'Key',
            cell: ({ row }) => (
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                    {row.original.key}
                </span>
            ),
        },
        {
            accessorKey: 'subject',
            header: 'Subject',
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.original.subject}
                </span>
            ),
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) =>
                row.original.is_active ? (
                    <Badge variant="default">Active</Badge>
                ) : (
                    <Badge variant="secondary">Inactive</Badge>
                ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <Button asChild variant="outline" size="sm">
                    <Link
                        href={EmailTemplateController.edit.url(row.original.id)}
                        prefetch
                        cacheFor={30}
                    >
                        <PencilIcon className="mr-1 h-3 w-3" />
                        Edit
                    </Link>
                </Button>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Email Templates" />
            <Wrapper>
                <PageHeader
                    title="Email Templates"
                    description="Manage email templates sent to customers. Templates are predefined — only content can be edited."
                />

                <DataTable
                    columns={columns}
                    data={templates.data}
                    pagination={{
                        current_page: templates.current_page,
                        last_page: templates.last_page,
                        per_page: templates.per_page,
                        total: templates.total,
                        prev_page_url: templates.prev_page_url,
                        next_page_url: templates.next_page_url,
                    }}
                />
            </Wrapper>
        </AppLayout>
    );
}
