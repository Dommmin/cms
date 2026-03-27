import { Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Star } from 'lucide-react';
import * as ReviewController from '@/actions/App/Http/Controllers/Admin/Ecommerce/ReviewController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { resolveLocalizedText } from '@/lib/localized-text';
import type { ReviewRow } from './review-columns.types';

const statusVariant: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    approved: 'default',
    pending: 'secondary',
    rejected: 'destructive',
};

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-3.5 w-3.5 ${
                        star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground/30'
                    }`}
                />
            ))}
        </div>
    );
}

export function useReviewColumns(): ColumnDef<ReviewRow>[] {
    const __ = useTranslation();

    return [
        {
            accessorKey: 'product',
            header: __('column.name', 'Product'),
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">
                        {resolveLocalizedText(row.original.product.name)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        /{row.original.product.slug}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'customer',
            header: __('column.customer', 'Customer'),
            cell: ({ row }) =>
                row.original.customer ? (
                    <div>
                        <div className="font-medium">
                            {row.original.customer.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {row.original.customer.email}
                        </div>
                    </div>
                ) : (
                    <span className="text-muted-foreground">
                        {__('misc.guest', 'Guest')}
                    </span>
                ),
        },
        {
            accessorKey: 'rating',
            header: 'Rating',
            cell: ({ row }) => <StarRating rating={row.original.rating} />,
        },
        {
            accessorKey: 'body',
            header: 'Review',
            cell: ({ row }) => (
                <div className="max-w-xs">
                    {row.original.title && (
                        <div className="truncate text-sm font-medium">
                            {row.original.title}
                        </div>
                    )}
                    <div className="line-clamp-2 text-sm text-muted-foreground">
                        {row.original.body}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: __('column.status', 'Status'),
            cell: ({ row }) => (
                <Badge
                    variant={statusVariant[row.original.status] ?? 'outline'}
                >
                    {row.original.status}
                </Badge>
            ),
        },
        {
            accessorKey: 'created_at',
            header: __('column.created_at', 'Date'),
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {new Date(row.original.created_at).toLocaleDateString(
                        'en-GB',
                        {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        },
                    )}
                </span>
            ),
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <Button asChild variant="outline" size="sm">
                    <Link
                        href={ReviewController.show.url(row.original.id)}
                        prefetch
                        cacheFor={60}
                    >
                        <Eye className="mr-1 h-3 w-3" />
                        View
                    </Link>
                </Button>
            ),
        },
    ];
}

/** @deprecated Use useReviewColumns() hook instead */
export const reviewColumns: ColumnDef<ReviewRow>[] = [];
