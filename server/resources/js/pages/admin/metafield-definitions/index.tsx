import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import * as MetafieldDefinitionController from '@/actions/App/Http/Controllers/Admin/MetafieldDefinitionController';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { IndexProps, MetafieldDefinition } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Metafield Definitions',
        href: MetafieldDefinitionController.index.url(),
    },
];

const OWNER_TYPE_LABELS: Record<string, string> = {
    'App\\Models\\Product': 'Product',
    'App\\Models\\BlogPost': 'Blog Post',
    'App\\Models\\Page': 'Page',
    'App\\Models\\Category': 'Category',
};

const TYPE_LABELS: Record<string, string> = {
    string: 'String',
    integer: 'Integer',
    float: 'Float',
    boolean: 'Boolean',
    json: 'JSON',
    date: 'Date',
    datetime: 'Datetime',
    url: 'URL',
    color: 'Color',
    image: 'Image',
    rich_text: 'Rich Text',
};

export default function MetafieldDefinitionsIndex({
    definitions,
    filters,
    ownerTypes,
}: IndexProps) {
    const __ = useTranslation();
    const [ownerTypeFilter, setOwnerTypeFilter] = useState(
        filters.owner_type ?? '',
    );

    const handleOwnerTypeChange = (value: string) => {
        setOwnerTypeFilter(value);
        router.get(
            MetafieldDefinitionController.index.url(),
            {
                ...(filters.search ? { search: filters.search } : {}),
                ...(value ? { owner_type: value } : {}),
            },
            { preserveState: true, replace: true },
        );
    };

    const columns: ColumnDef<MetafieldDefinition>[] = [
        {
            accessorKey: 'name',
            header: __('column.name', 'Name'),
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.name}</p>
                    {row.original.description && (
                        <p className="text-xs text-muted-foreground">
                            {row.original.description}
                        </p>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'owner_type',
            header: 'Owner Type',
            cell: ({ row }) => (
                <Badge variant="outline">
                    {OWNER_TYPE_LABELS[row.original.owner_type] ??
                        row.original.owner_type}
                </Badge>
            ),
        },
        {
            accessorKey: 'namespace',
            header: 'Namespace',
            cell: ({ row }) => (
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                    {row.original.namespace}
                </code>
            ),
        },
        {
            accessorKey: 'key',
            header: 'Key',
            cell: ({ row }) => (
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                    {row.original.key}
                </code>
            ),
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => (
                <Badge variant="secondary">
                    {TYPE_LABELS[row.original.type] ?? row.original.type}
                </Badge>
            ),
        },
        {
            accessorKey: 'pinned',
            header: 'Pinned',
            cell: ({ row }) => (
                <Badge variant={row.original.pinned ? 'default' : 'outline'}>
                    {row.original.pinned ? 'Yes' : 'No'}
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
            id: 'actions',
            header: __('column.actions', 'Actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={MetafieldDefinitionController.edit.url(
                                row.original.id,
                            )}
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
                        title="Delete Definition"
                        description="Are you sure? This action cannot be undone."
                        onConfirm={() => {
                            router.delete(
                                MetafieldDefinitionController.destroy.url(
                                    row.original.id,
                                ),
                                {
                                    onSuccess: () =>
                                        toast.success('Definition deleted'),
                                },
                            );
                        }}
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
            <Head title="Metafield Definitions" />
            <Wrapper>
                <PageHeader
                    title="Metafield Definitions"
                    description="Define custom metafields for your content types"
                >
                    <PageHeaderActions>
                        <Link
                            href={MetafieldDefinitionController.create.url()}
                        >
                            <Button variant="outline">
                                <PlusIcon className="mr-2 h-4 w-4" />
                                New Definition
                            </Button>
                        </Link>
                    </PageHeaderActions>
                </PageHeader>

                <div className="mb-4 flex items-center gap-3">
                    <Select
                        value={ownerTypeFilter || 'all'}
                        onValueChange={(val) =>
                            handleOwnerTypeChange(val === 'all' ? '' : val)
                        }
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="All owner types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All owner types</SelectItem>
                            {ownerTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {OWNER_TYPE_LABELS[type] ?? type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <DataTable
                    columns={columns}
                    data={definitions.data}
                    pagination={{
                        current_page: definitions.current_page,
                        last_page: definitions.last_page,
                        per_page: definitions.per_page,
                        total: definitions.total,
                        prev_page_url: definitions.prev_page_url ?? null,
                        next_page_url: definitions.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder="Search definitions..."
                    searchValue={filters.search ?? ''}
                    baseUrl={MetafieldDefinitionController.index.url()}
                />
            </Wrapper>
        </AppLayout>
    );
}
