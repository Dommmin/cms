import { router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { PencilIcon, TrashIcon, Package } from 'lucide-react';
import { ConfirmButton } from '@/components/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { resolveLocalizedText } from '@/lib/localized-text';

export type ProductRow = {
    id: number;
    name: string | Record<string, string>;
    slug: string;
    price: number;
    is_active: boolean;
    is_saleable: boolean;
    category?: { id: number; name: string | Record<string, string> };
    product_type?: { id: number; name: string | Record<string, string> };
    images?: Array<{ url: string }>;
};

export const productColumns: ColumnDef<ProductRow>[] = [
    {
        accessorKey: 'name',
        header: 'Product',
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                    {row.original.images?.[0] ? (
                        <img
                            src={row.original.images[0].url}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <Package className="h-5 w-5 text-muted-foreground" />
                    )}
                </div>
                <div>
                    <div className="font-medium">{resolveLocalizedText(row.original.name)}</div>
                    <div className="text-xs text-muted-foreground">
                        /{row.original.slug}
                    </div>
                </div>
            </div>
        ),
    },
    {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) =>
            row.original.category ? (
                <span className="text-sm">{resolveLocalizedText(row.original.category.name)}</span>
            ) : (
                <span className="text-muted-foreground">—</span>
            ),
    },
    {
        accessorKey: 'product_type',
        header: 'Type',
        cell: ({ row }) =>
            row.original.product_type ? (
                <span className="text-sm">
                    {resolveLocalizedText(row.original.product_type.name)}
                </span>
            ) : (
                <span className="text-muted-foreground">—</span>
            ),
    },
    {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => (
            <span className="font-mono font-medium">
                {new Intl.NumberFormat('pl-PL', {
                    style: 'currency',
                    currency: 'PLN',
                }).format(row.original.price / 100)}
            </span>
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
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        router.visit(
                            `/admin/ecommerce/products/${row.original.id}/edit`,
                        )
                    }
                >
                    <PencilIcon className="mr-1 h-3 w-3" />
                    Edit
                </Button>
                <ConfirmButton
                    variant="destructive"
                    size="sm"
                    title="Delete Product"
                    description={`Are you sure you want to delete "${resolveLocalizedText(row.original.name)}"? This action cannot be undone.`}
                    onConfirm={() => {
                        router.delete(
                            `/admin/ecommerce/products/${row.original.id}`,
                        );
                    }}
                >
                    <TrashIcon className="mr-1 h-3 w-3" />
                </ConfirmButton>
            </div>
        ),
    },
];
