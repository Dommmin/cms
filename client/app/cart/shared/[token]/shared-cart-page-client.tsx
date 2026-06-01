'use client';

import type { AxiosError } from 'axios';
import {
    AlertTriangle,
    CheckCircle2,
    CopyPlus,
    Loader2,
    RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { useCurrency } from '@/hooks/use-currency';
import { useLocalePath } from '@/hooks/use-locale';
import {
    useImportSharedCart,
    useSharedCartPreview,
} from '@/hooks/use-shared-cart';
import { useTranslation } from '@/hooks/use-translation';
import type { SharedCartPreviewItem } from '@/types/api';
import type { SharedCartPageClientProps } from './shared-cart-page-client.types';

function badgeClass(status: SharedCartPreviewItem['status']): string {
    if (status === 'available') {
        return 'bg-green-100 text-green-800';
    }

    if (status === 'partial') {
        return 'bg-amber-100 text-amber-800';
    }

    return 'bg-red-100 text-red-700';
}

function errorMessage(error: unknown): string {
    const axiosError = error as AxiosError<{ message?: string }>;
    const status = axiosError.response?.status;

    if (status === 410) {
        return 'This shared cart link has expired or was disabled.';
    }

    if (status === 404) {
        return 'This shared cart link could not be found.';
    }

    return (
        axiosError.response?.data?.message ??
        'Could not load this shared cart right now.'
    );
}

export function SharedCartPageClient({ token }: SharedCartPageClientProps) {
    const router = useRouter();
    const lp = useLocalePath();
    const { t } = useTranslation();
    const { formatPrice } = useCurrency();
    const { data, isLoading, error } = useSharedCartPreview(token);
    const { mutate: importCart, isPending } = useImportSharedCart(token);

    function handleImport(mode: 'merge' | 'replace'): void {
        importCart(mode, {
            onSuccess: (result) => {
                toast.success(result.message);
                router.push(lp('/cart'));
            },
            onError: () => {
                toast.error(
                    t(
                        'cart.share_import_error',
                        'Could not import this shared cart.',
                    ),
                );
            },
        });
    }

    if (isLoading) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="space-y-4">
                    <div className="bg-muted h-12 w-2/3 animate-pulse rounded-xl" />
                    <div className="bg-muted h-32 animate-pulse rounded-xl" />
                    <div className="bg-muted h-32 animate-pulse rounded-xl" />
                </div>
            </div>
        );
    }

    if (!data || error) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="border-border bg-card rounded-2xl border p-8 text-center">
                    <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-500" />
                    <h1 className="mb-2 text-2xl font-semibold">
                        {t(
                            'cart.shared_unavailable',
                            'Shared cart unavailable',
                        )}
                    </h1>
                    <p className="text-muted-foreground mb-6">
                        {errorMessage(error)}
                    </p>
                    <Link
                        href={lp('/cart')}
                        className="bg-primary text-primary-foreground inline-flex rounded-xl px-5 py-3 font-semibold hover:opacity-90"
                    >
                        {t('cart.go_to_cart', 'Go to your cart')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-primary mb-2 text-sm font-semibold tracking-[0.2em] uppercase">
                        {t('cart.shared_snapshot', 'Shared cart snapshot')}
                    </p>
                    <h1 className="text-3xl font-bold">
                        {t('cart.shared_title', 'Preview shared cart')}
                    </h1>
                    <p className="text-muted-foreground mt-3 max-w-2xl text-sm">
                        {t(
                            'cart.shared_notice',
                            'Prices and availability are recalculated when you import this cart into your own basket.',
                        )}
                    </p>
                    {data.expires_at && (
                        <p className="text-muted-foreground mt-2 text-sm">
                            {t('cart.shared_expires', 'Expires')}:{' '}
                            {new Date(data.expires_at).toLocaleString()}
                        </p>
                    )}
                </div>

                <div className="border-border bg-card min-w-[280px] rounded-2xl border p-5">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                {t('cart.items', 'Items')}
                            </span>
                            <span>{data.items_count}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                {t(
                                    'cart.shared_estimated_total',
                                    'Estimated total',
                                )}
                            </span>
                            <span className="font-semibold">
                                {formatPrice(data.estimated_subtotal)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                {t(
                                    'cart.shared_original_total',
                                    'Original shared total',
                                )}
                            </span>
                            <span>{formatPrice(data.shared_subtotal)}</span>
                        </div>
                    </div>

                    <div className="mt-4 space-y-2">
                        <Button
                            className="w-full"
                            disabled={isPending}
                            onClick={() => handleImport('merge')}
                        >
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CopyPlus className="h-4 w-4" />
                            )}
                            {t('cart.shared_import_merge', 'Add to my cart')}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            disabled={isPending}
                            onClick={() => handleImport('replace')}
                        >
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                            {t(
                                'cart.shared_import_replace',
                                'Replace my cart with this',
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {data.items.map((item) => (
                    <div
                        key={`${item.variant_id}-${item.variant.sku ?? 'variant'}`}
                        className="border-border bg-card rounded-2xl border p-5"
                    >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg font-semibold">
                                        {item.product.name}
                                    </h2>
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass(item.status)}`}
                                    >
                                        {item.status}
                                    </span>
                                </div>
                                {item.variant.name && (
                                    <p className="text-muted-foreground text-sm">
                                        {item.variant.name}
                                    </p>
                                )}
                                {item.variant.sku && (
                                    <p className="text-muted-foreground text-xs">
                                        SKU: {item.variant.sku}
                                    </p>
                                )}
                                <p className="text-sm">
                                    {item.status === 'available' ? (
                                        <CheckCircle2 className="mr-1 inline h-4 w-4 text-green-600" />
                                    ) : (
                                        <AlertTriangle className="mr-1 inline h-4 w-4 text-amber-500" />
                                    )}
                                    {item.status_message}
                                </p>
                            </div>

                            <div className="grid min-w-[220px] gap-2 text-sm">
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">
                                        {t(
                                            'cart.shared_requested_qty',
                                            'Requested',
                                        )}
                                    </span>
                                    <span>{item.requested_quantity}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">
                                        {t(
                                            'cart.shared_import_qty',
                                            'Will import',
                                        )}
                                    </span>
                                    <span>{item.import_quantity}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">
                                        {t(
                                            'cart.shared_current_price',
                                            'Current unit price',
                                        )}
                                    </span>
                                    <span>
                                        {formatPrice(item.current_unit_price)}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">
                                        {t(
                                            'cart.shared_shared_price',
                                            'Shared unit price',
                                        )}
                                    </span>
                                    <span>
                                        {formatPrice(item.shared_unit_price)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
