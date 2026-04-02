'use client';

import { ShoppingCart, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { startTransition, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { PriceDisplay } from '@/components/price-display';
import { useAddToCart } from '@/hooks/use-cart';
import {
    clearComparison,
    removeFromCompare,
    useComparisonIds,
    useComparisonProducts,
} from '@/hooks/use-comparison';
import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';
import type { Product } from '@/types/api';

import type { CompareRow } from './page.types';

export default function ComparePage() {
    const { t } = useTranslation();
    const lp = useLocalePath();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        startTransition(() => setMounted(true));
    }, []);

    const ids = useComparisonIds();
    const { data, isLoading } = useComparisonProducts();
    const { mutate: addToCart } = useAddToCart();

    const products: Product[] = data?.products ?? [];
    const attributeKeys: string[] = data?.attributeKeys ?? [];

    if (!mounted) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="bg-muted h-8 w-48 animate-pulse rounded" />
            </div>
        );
    }

    if (ids.length === 0) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
                <h1 className="mb-4 text-2xl font-bold">
                    {t('compare.empty_title', 'No products to compare')}
                </h1>
                <p className="text-muted-foreground mb-6">
                    {t(
                        'compare.empty_desc',
                        'Add products to compare from the product listing.',
                    )}
                </p>
                <Link
                    href={lp('/products')}
                    className="bg-primary text-primary-foreground inline-flex items-center rounded-xl px-6 py-3 text-sm font-medium hover:opacity-90"
                >
                    {t('compare.browse', 'Browse products')}
                </Link>
            </div>
        );
    }

    if (ids.length === 1) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
                <h1 className="mb-4 text-2xl font-bold">
                    {t('compare.one_title', 'Add one more product')}
                </h1>
                <p className="text-muted-foreground mb-6">
                    {t(
                        'compare.one_desc',
                        'You need at least 2 products to compare. Add another product from the listing.',
                    )}
                </p>
                <Link
                    href={lp('/products')}
                    className="bg-primary text-primary-foreground inline-flex items-center rounded-xl px-6 py-3 text-sm font-medium hover:opacity-90"
                >
                    {t('compare.browse', 'Browse products')}
                </Link>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <div className="bg-muted h-7 w-48 animate-pulse rounded" />
                    <div className="bg-muted h-5 w-16 animate-pulse rounded" />
                </div>
                <div
                    className="grid gap-4"
                    style={{
                        gridTemplateColumns: `220px repeat(${ids.length}, 1fr)`,
                    }}
                >
                    <div />
                    {ids.map((id) => (
                        <div
                            key={id}
                            className="bg-muted h-72 animate-pulse rounded-xl"
                        />
                    ))}
                </div>
            </div>
        );
    }

    const colStyle = {
        gridTemplateColumns: `220px repeat(${products.length}, 1fr)`,
    };

    // ── Base rows (always shown) ──────────────────────────────────────────────
    const baseRows: CompareRow[] = [
        {
            label: t('compare.price', 'Price'),
            group: t('compare.group_overview', 'Overview'),
            rawValue: (p) => String(p.price_min),
            render: (p) => (
                <PriceDisplay
                    price={p.price_min}
                    compareAtPrice={p.compare_at_price_min}
                    omnibusPrice={p.omnibus_price_min}
                    isOnSale={p.is_on_sale}
                    size="base"
                />
            ),
        },
        {
            label: t('compare.availability', 'Availability'),
            group: t('compare.group_overview', 'Overview'),
            rawValue: (p) => String(p.is_active),
            render: (p) =>
                p.is_active ? (
                    <span className="inline-flex items-center gap-1 font-medium text-green-600">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        {t('compare.in_stock', 'In stock')}
                    </span>
                ) : (
                    <span className="text-muted-foreground">
                        {t('compare.unavailable', 'Unavailable')}
                    </span>
                ),
        },
        {
            label: t('compare.brand', 'Brand'),
            group: t('compare.group_overview', 'Overview'),
            rawValue: (p) => p.brand?.name ?? '',
            render: (p) =>
                p.brand?.name ?? (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        {
            label: t('compare.category', 'Category'),
            group: t('compare.group_overview', 'Overview'),
            rawValue: (p) => p.category?.name ?? '',
            render: (p) =>
                p.category?.name ?? (
                    <span className="text-muted-foreground">—</span>
                ),
        },
    ];

    // ── Attribute rows (from product attribute_map, union of all keys) ─────────
    const attributeRows: CompareRow[] = attributeKeys.map((key) => ({
        label: key,
        group: t('compare.group_specs', 'Specifications'),
        rawValue: (p) => (p.attribute_map?.[key] ?? []).join(', '),
        render: (p) => {
            const values = p.attribute_map?.[key];
            if (!values || values.length === 0) {
                return <span className="text-muted-foreground">—</span>;
            }
            return (
                <div className="flex flex-wrap gap-1">
                    {values.map((v) => (
                        <span
                            key={v}
                            className="bg-accent text-foreground rounded-md px-2 py-0.5 text-xs font-medium"
                        >
                            {v}
                        </span>
                    ))}
                </div>
            );
        },
    }));

    const allRows = [...baseRows, ...attributeRows];

    // Determine which rows differ across products (highlight those)
    const differingLabels = new Set(
        allRows
            .filter((row) => {
                if (!row.rawValue) return false;
                const vals = products.map(row.rawValue);
                return vals.some((v) => v !== vals[0]);
            })
            .map((r) => r.label),
    );

    // Group rows for rendering
    const groups: { label: string; rows: CompareRow[] }[] = [];
    for (const row of allRows) {
        const groupLabel = row.group ?? '';
        const existing = groups.find((g) => g.label === groupLabel);
        if (existing) {
            existing.rows.push(row);
        } else {
            groups.push({ label: groupLabel, rows: [row] });
        }
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">
                        {t('compare.title', 'Compare Products')}
                    </h1>
                    {products.length > 0 &&
                        new Set(products.map((p) => p.product_type_id)).size >
                            1 && (
                            <p className="text-muted-foreground mt-1 text-sm">
                                {t(
                                    'compare.mixed_types_notice',
                                    'Products are from different categories — specs may vary.',
                                )}
                            </p>
                        )}
                </div>
                <button
                    onClick={clearComparison}
                    className="text-muted-foreground hover:text-foreground text-sm underline"
                >
                    {t('compare.clear_all', 'Clear all')}
                </button>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-[560px]">
                    {/* Sticky product header row */}
                    <div className="grid gap-0 border-b pb-4" style={colStyle}>
                        {/* Legend cell */}
                        <div className="flex items-end pr-4 pb-2">
                            {differingLabels.size > 0 && (
                                <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                                    <span className="inline-block h-2 w-2 rounded-full bg-yellow-400" />
                                    {t(
                                        'compare.differences_legend',
                                        'Differences highlighted',
                                    )}
                                </span>
                            )}
                        </div>

                        {products.map((product) => (
                            <div key={product.id} className="pr-3">
                                {/* Remove button */}
                                <div className="mb-2 flex justify-end">
                                    <button
                                        onClick={() =>
                                            removeFromCompare(product.id)
                                        }
                                        className="text-muted-foreground hover:text-foreground"
                                        aria-label={t(
                                            'compare.remove',
                                            'Remove from comparison',
                                        )}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Thumbnail */}
                                <div className="bg-muted relative mx-auto mb-3 aspect-square w-32 overflow-hidden rounded-xl">
                                    {product.thumbnail?.url ? (
                                        <Image
                                            src={product.thumbnail.url}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            sizes="128px"
                                        />
                                    ) : null}
                                </div>

                                {/* Name */}
                                <Link
                                    href={lp(`/products/${product.slug}`)}
                                    className="hover:text-primary block text-center text-sm leading-snug font-semibold hover:underline"
                                >
                                    {product.name}
                                </Link>

                                {/* Short description */}
                                {product.short_description && (
                                    <p className="text-muted-foreground mt-1 line-clamp-2 text-center text-xs">
                                        {product.short_description}
                                    </p>
                                )}

                                {/* Add to cart */}
                                <button
                                    onClick={() => {
                                        const variant = product.variants?.[0];
                                        if (variant) {
                                            addToCart(
                                                {
                                                    variant_id: variant.id,
                                                    quantity: 1,
                                                },
                                                {
                                                    onSuccess: () =>
                                                        toast.success(
                                                            t(
                                                                'product.added_to_cart',
                                                                'Added to cart!',
                                                            ),
                                                        ),
                                                },
                                            );
                                        }
                                    }}
                                    disabled={
                                        !product.is_active ||
                                        !product.variants?.length
                                    }
                                    className="bg-primary text-primary-foreground mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                                >
                                    <ShoppingCart className="h-3.5 w-3.5" />
                                    {t('product.add_to_cart', 'Add to Cart')}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Attribute groups */}
                    {groups.map((group) => (
                        <div key={group.label} className="mt-6">
                            {/* Group heading */}
                            {group.label && (
                                <div className="grid" style={colStyle}>
                                    <div className="border-border border-b py-2 pr-4">
                                        <span className="text-foreground text-xs font-bold tracking-wider uppercase">
                                            {group.label}
                                        </span>
                                    </div>
                                    {products.map((p) => (
                                        <div
                                            key={p.id}
                                            className="border-border border-b py-2 pr-3"
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Rows */}
                            {group.rows.map((row) => {
                                const isDifferent = differingLabels.has(
                                    row.label,
                                );
                                return (
                                    <div
                                        key={row.label}
                                        className={`grid border-b last:border-b-0 ${isDifferent ? 'bg-yellow-50/60 dark:bg-yellow-900/10' : ''}`}
                                        style={colStyle}
                                    >
                                        {/* Label */}
                                        <div className="text-muted-foreground flex items-center py-3 pr-4 text-xs font-medium">
                                            {row.label}
                                            {isDifferent && (
                                                <span
                                                    className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-yellow-400"
                                                    aria-label="Differs"
                                                />
                                            )}
                                        </div>
                                        {/* Values */}
                                        {products.map((product) => (
                                            <div
                                                key={product.id}
                                                className="flex items-center py-3 pr-3 text-sm"
                                            >
                                                {row.render(product)}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Add more CTA */}
            {ids.length < 4 && (
                <div className="mt-8 text-center">
                    <Link
                        href={lp('/products')}
                        className="border-input hover:bg-accent inline-flex items-center rounded-xl border px-5 py-2.5 text-sm font-medium"
                    >
                        {t(
                            'compare.add_more',
                            '+ Add another product to compare',
                        )}
                    </Link>
                </div>
            )}
        </div>
    );
}
