import { Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Folder, PencilIcon, TrashIcon } from 'lucide-react';
import * as CategoryController from '@/actions/App/Http/Controllers/Admin/Ecommerce/CategoryController';
import { ConfirmButton } from '@/components/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { resolveLocalizedText } from '@/lib/localized-text';
import type { CategoryRow } from './category-columns.types';

export function useCategoryColumns(): ColumnDef<CategoryRow>[] {
    const __ = useTranslation();

    return [
        {
            accessorKey: 'name',
            header: __('column.category', 'Category'),
            cell: ({ row }) => {
                const depth = row.original.depth ?? 0;
                const categoryName = resolveLocalizedText(row.original.name);
                const categoryDescription = resolveLocalizedText(
                    row.original.description,
                );
                return (
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded bg-blue-100"
                            style={{ marginLeft: depth * 24 }}
                        >
                            <Folder className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <div className="font-medium">{categoryName}</div>
                            {categoryDescription && (
                                <div className="max-w-xs truncate text-xs text-muted-foreground">
                                    {categoryDescription}
                                </div>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'parent',
            header: 'Parent',
            cell: ({ row }) =>
                row.original.parent ? (
                    <span className="text-sm text-muted-foreground">
                        {resolveLocalizedText(row.original.parent.name)}
                    </span>
                ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                ),
        },
        {
            accessorKey: 'slug',
            header: __('column.slug', 'Slug'),
            cell: ({ row }) => (
                <span className="font-mono text-sm text-muted-foreground">
                    /{row.original.slug}
                </span>
            ),
        },
        {
            accessorKey: 'products_count',
            header: __('column.products', 'Products'),
            cell: ({ row }) => (
                <span className="text-sm">
                    {row.original.products_count ?? 0}
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
                            href={CategoryController.edit.url(row.original.id)}
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
                        title={__('dialog.delete_title', 'Delete Category')}
                        description={`${__('dialog.are_you_sure', 'Are you sure?')} ${__('dialog.cannot_be_undone', 'This action cannot be undone.')}`}
                        onConfirm={() => {
                            router.delete(
                                CategoryController.destroy.url(row.original.id),
                            );
                        }}
                    >
                        <TrashIcon className="mr-1 h-3 w-3" />
                    </ConfirmButton>
                </div>
            ),
        },
    ];
}

/** @deprecated Use useCategoryColumns() hook instead */
export const categoryColumns: ColumnDef<CategoryRow>[] = [];
