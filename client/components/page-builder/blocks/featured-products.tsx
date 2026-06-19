import Link from 'next/link';

import { BlockHeader } from '@/components/composition';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { getRelationsByKey } from '@/lib/format';
import type { Product } from '@/types/api';
import type {
    FeaturedProductsConfig,
    FeaturedProductsProps,
} from './featured-products.types';

function FeaturedProductsSkeleton({
    count,
    colClass,
}: {
    count: number;
    colClass: string;
}) {
    return (
        <div className={`grid gap-6 ${colClass}`}>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="flex flex-col gap-3">
                    <Skeleton className="aspect-square w-full rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            ))}
        </div>
    );
}

export function FeaturedProductsBlock({ block }: FeaturedProductsProps) {
    const cfg = block.configuration as FeaturedProductsConfig;
    const columns = cfg.items_per_row ?? 4;

    const productRelations = getRelationsByKey(block.relations, 'products');
    const products = productRelations
        .map((r) => r.data as Product | null)
        .filter((p): p is Product => p !== null)
        .sort((a, b) => {
            const ra = productRelations.find(
                (r) => (r.data as unknown as Product)?.id === a.id,
            );
            const rb = productRelations.find(
                (r) => (r.data as unknown as Product)?.id === b.id,
            );
            return (ra?.position ?? 0) - (rb?.position ?? 0);
        });

    const colClass =
        {
            1: 'grid-cols-1',
            2: 'grid-cols-1 sm:grid-cols-2',
            3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
            4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
            5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
            6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
        }[columns] ?? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

    const skeletonCount = Math.min(cfg.max_items ?? 8, columns);

    return (
        <div className="flex flex-col gap-8">
            <BlockHeader
                title={cfg.title}
                description={cfg.subtitle}
                compactDescription
                trailing={
                    cfg.view_all_url ? (
                        <Link
                            href={cfg.view_all_url}
                            className="text-primary text-sm font-medium hover:underline"
                        >
                            {cfg.view_all_label ?? 'View all →'}
                        </Link>
                    ) : undefined
                }
            />

            {products.length > 0 ? (
                <div className={`grid gap-6 ${colClass}`}>
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <FeaturedProductsSkeleton
                    count={skeletonCount}
                    colClass={colClass}
                />
            )}
        </div>
    );
}
