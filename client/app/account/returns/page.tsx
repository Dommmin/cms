'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { getReturns } from '@/api/orders';
import { useCurrency } from '@/hooks/use-currency';
import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';

const RETURN_STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    refunded: 'bg-green-100 text-green-800',
    received: 'bg-orange-100 text-orange-800',
    return_label_sent: 'bg-purple-100 text-purple-800',
    awaiting_return: 'bg-purple-50 text-purple-700',
    inspected: 'bg-gray-100 text-gray-800',
    closed: 'bg-gray-100 text-gray-600',
};

function formatLabel(value: string): string {
    return value
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function AccountReturnsPage() {
    const { t } = useTranslation();
    const lp = useLocalePath();
    const { formatPrice } = useCurrency();
    const router = useRouter();
    const searchParams = useSearchParams();

    const parsedPage = Number(searchParams.get('page') ?? '1');
    const page =
        Number.isFinite(parsedPage) && parsedPage > 0
            ? Math.floor(parsedPage)
            : 1;

    const { data, isLoading, isError } = useQuery({
        queryKey: ['returns', 'list', page],
        queryFn: () => getReturns({ page }),
    });

    const returns = data?.data ?? [];
    const meta = data?.meta;

    const goToPage = (targetPage: number) => {
        router.push(lp(`/account/returns?page=${targetPage}`));
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="bg-muted h-8 w-48 animate-pulse rounded" />
                    <div className="bg-muted h-4 w-72 animate-pulse rounded" />
                </div>
                {Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={index}
                        className="border-border bg-card h-28 animate-pulse rounded-xl border"
                    />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="border-border bg-card rounded-xl border p-8 text-center">
                <p className="font-medium">
                    {t(
                        'account.returns_load_error',
                        'Could not load your returns.',
                    )}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold">
                        {t('account.returns', 'Returns & Complaints')}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {t(
                            'account.returns_intro',
                            'Track all return and complaint cases linked to your account.',
                        )}
                    </p>
                </div>
                <Link
                    href={lp('/account/orders')}
                    className="text-primary text-sm font-medium hover:underline"
                >
                    {t('account.my_orders', 'My Orders')}
                </Link>
            </div>

            {returns.length === 0 ? (
                <div className="border-border bg-card rounded-xl border py-16 text-center">
                    <RefreshCw
                        className="text-muted-foreground mx-auto mb-4 h-12 w-12"
                        aria-hidden="true"
                    />
                    <p className="text-muted-foreground">
                        {t(
                            'account.no_returns',
                            'You have no returns or complaints yet.',
                        )}
                    </p>
                    <Link
                        href={lp('/account/orders')}
                        className="bg-primary text-primary-foreground mt-4 inline-flex items-center rounded-xl px-6 py-2.5 text-sm font-semibold hover:opacity-90"
                    >
                        {t('account.view_orders', 'View orders')}
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {returns.map((ret) => (
                        <article
                            key={ret.id}
                            className="border-border bg-card rounded-xl border p-4"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-mono text-sm font-semibold">
                                            {ret.reference_number}
                                        </span>
                                        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs capitalize">
                                            {formatLabel(ret.return_type)}
                                        </span>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                                                RETURN_STATUS_COLORS[
                                                    ret.status
                                                ] ??
                                                'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            {formatLabel(ret.status)}
                                        </span>
                                    </div>

                                    <p className="text-muted-foreground mt-2 text-sm">
                                        {ret.reason ??
                                            t(
                                                'account.returns_no_reason',
                                                'No reason provided.',
                                            )}
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                                        {ret.order_reference_number && (
                                            <Link
                                                href={lp(
                                                    `/account/orders/${ret.order_reference_number}`,
                                                )}
                                                className="text-primary font-medium hover:underline"
                                            >
                                                {t(
                                                    'account.order_reference',
                                                    'Order',
                                                )}{' '}
                                                #{ret.order_reference_number}
                                            </Link>
                                        )}
                                        {ret.return_tracking_number && (
                                            <span className="text-muted-foreground font-mono">
                                                {t(
                                                    'account.return_tracking',
                                                    'Tracking',
                                                )}
                                                : {ret.return_tracking_number}
                                            </span>
                                        )}
                                    </div>

                                    {ret.items.length > 0 && (
                                        <ul className="text-muted-foreground mt-3 space-y-1 text-sm">
                                            {ret.items.map((item, index) => (
                                                <li key={index}>
                                                    {item.product_name ??
                                                        t('order.item', 'Item')}
                                                    {' × '}
                                                    {item.quantity}
                                                    {item.condition
                                                        ? ` · ${item.condition}`
                                                        : ''}
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {ret.refund_amount !== null && (
                                        <p className="mt-3 text-sm">
                                            <span className="text-muted-foreground">
                                                {t(
                                                    'account.refund_amount',
                                                    'Refund amount',
                                                )}
                                                :{' '}
                                            </span>
                                            <span className="font-medium text-green-600">
                                                {formatPrice(ret.refund_amount)}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                <div className="flex shrink-0 flex-col items-end gap-2">
                                    <time
                                        dateTime={ret.created_at}
                                        className="text-muted-foreground text-xs"
                                    >
                                        {formatDate(ret.created_at)}
                                    </time>
                                    <Link
                                        href={lp(
                                            `/account/returns/${ret.reference_number}`,
                                        )}
                                        className="bg-primary/10 text-primary hover:bg-primary/15 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium"
                                    >
                                        {t(
                                            'account.view_details',
                                            'View details',
                                        )}
                                        <ArrowRight
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {meta && meta.last_page > 1 && (
                <nav
                    aria-label={t(
                        'account.returns_pagination',
                        'Returns pagination',
                    )}
                    className="flex items-center justify-between gap-3"
                >
                    <button
                        type="button"
                        onClick={() => goToPage(meta.current_page - 1)}
                        disabled={meta.current_page <= 1}
                        className="border-input bg-background hover:bg-accent rounded-xl border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {t('account.previous', 'Previous')}
                    </button>
                    <span className="text-muted-foreground text-sm">
                        {t('account.page', 'Page')}{' '}
                        {meta.current_page.toString()} {t('account.of', 'of')}{' '}
                        {meta.last_page.toString()}
                    </span>
                    <button
                        type="button"
                        onClick={() => goToPage(meta.current_page + 1)}
                        disabled={meta.current_page >= meta.last_page}
                        className="border-input bg-background hover:bg-accent rounded-xl border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {t('account.next', 'Next')}
                    </button>
                </nav>
            )}
        </div>
    );
}
