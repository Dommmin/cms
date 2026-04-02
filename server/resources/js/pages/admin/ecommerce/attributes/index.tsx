import { Head, Link, router } from '@inertiajs/react';
import { List, PencilIcon, Plus, TrashIcon } from 'lucide-react';
import * as AttributeController from '@/actions/App/Http/Controllers/Admin/Ecommerce/AttributeController';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Attributes',
        href: AttributeController.index.url(),
    },
];

export default function AttributesIndex({ attributes, filters }: IndexProps) {
    const __ = useTranslation();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attributes" />

            <Wrapper>
                <PageHeader
                    title={__('page.attributes', 'Attributes')}
                    description={`${attributes.total} product attributes`}
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link
                                href={AttributeController.create.url()}
                                prefetch
                                cacheFor={30}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                {__('action.add_attribute', 'Add Attribute')}
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={[
                        {
                            accessorKey: 'name',
                            header: __('column.attribute', 'Attribute'),
                            cell: ({ row }) => (
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-green-100">
                                        <List className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <span className="font-medium">
                                            {row.original.name}
                                        </span>
                                        <p className="text-xs text-muted-foreground">
                                            /{row.original.slug}
                                        </p>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            accessorKey: 'type',
                            header: __('column.type', 'Type'),
                            cell: ({ row }) => (
                                <span className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs">
                                    {row.original.type}
                                </span>
                            ),
                        },
                        {
                            accessorKey: 'values_count',
                            header: __('column.values', 'Values'),
                        },
                        {
                            accessorKey: 'is_filterable',
                            header: __('column.usage', 'Usage'),
                            cell: ({ row }) => (
                                <div className="flex gap-1">
                                    {row.original.is_filterable && (
                                        <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                                            Filter
                                        </span>
                                    )}
                                    {row.original.is_variant_selection && (
                                        <span className="rounded bg-purple-100 px-2 py-1 text-xs text-purple-700">
                                            Variant
                                        </span>
                                    )}
                                </div>
                            ),
                        },
                        {
                            id: 'actions',
                            header: __('column.actions', 'Actions'),
                            cell: ({ row }) => (
                                <div className="flex items-center gap-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link
                                            href={AttributeController.edit.url(
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
                                        title={__(
                                            'dialog.delete_title',
                                            'Delete Attribute',
                                        )}
                                        description={`${__('dialog.are_you_sure', 'Are you sure you want to delete')} "${row.original.name}"?`}
                                        onConfirm={() => {
                                            router.delete(
                                                AttributeController.destroy.url(
                                                    row.original.id,
                                                ),
                                            );
                                        }}
                                    >
                                        <TrashIcon className="mr-1 h-3 w-3" />
                                    </ConfirmButton>
                                </div>
                            ),
                        },
                    ]}
                    data={attributes.data}
                    pagination={{
                        current_page: attributes.current_page,
                        last_page: attributes.last_page,
                        per_page: attributes.per_page,
                        total: attributes.total,
                        prev_page_url: attributes.prev_page_url ?? null,
                        next_page_url: attributes.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder={__(
                        'placeholder.search_attributes',
                        'Search attributes...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl={AttributeController.index.url()}
                />
            </Wrapper>
        </AppLayout>
    );
}
