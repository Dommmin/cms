import { Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { PencilIcon, TrashIcon, Folder } from 'lucide-react';
import { ConfirmButton } from '@/components/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { resolveLocalizedText } from '@/lib/localized-text';

export type CategoryRow = {
    id: number;
    name: string | Record<string, string>;
    slug: string;
    description?: string | Record<string, string> | null;
    is_active: boolean;
    parent_id?: number | null;
    parent?: { id: number; name: string | Record<string, string> } | null;
    children?: CategoryRow[];
    products_count?: number;
    depth?: number;
};

export const categoryColumns: ColumnDef<CategoryRow>[] = [
    {
        accessorKey: 'name',
        header: 'Category',
        cell: ({ row }) => {
            const depth = row.original.depth ?? 0;
            const categoryName = resolveLocalizedText(row.original.name);
            const categoryDescription = resolveLocalizedText(row.original.description);
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
        header: 'Slug',
        cell: ({ row }) => (
            <span className="font-mono text-sm text-muted-foreground">
                /{row.original.slug}
            </span>
        ),
    },
    {
        accessorKey: 'products_count',
        header: 'Products',
        cell: ({ row }) => (
            <span className="text-sm">{row.original.products_count ?? 0}</span>
        ),
    },
    {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => (
            <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
                {row.original.is_active ? 'Active' : 'Inactive'}
            </Badge>
        ),
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/ecommerce/categories/${row.original.id}/edit`} prefetch cacheFor={30}>
                        <PencilIcon className="mr-1 h-3 w-3" />
                        Edit
                    </Link>
                </Button>
                <ConfirmButton
                    variant="destructive"
                    size="sm"
                    title="Delete Category"
                    description={`Are you sure you want to delete "${resolveLocalizedText(row.original.name)}"? This action cannot be undone.`}
                    onConfirm={() => {
                        router.delete(
                            `/admin/ecommerce/categories/${row.original.id}`,
                        );
                    }}
                >
                    <TrashIcon className="mr-1 h-3 w-3" />
                </ConfirmButton>
            </div>
        ),
    },
];
