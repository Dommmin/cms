'use client';

import { isAxiosError } from 'axios';
import {
    ArrowRight,
    CheckCircle2,
    Loader2,
    Package,
    Search,
    ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { lookupGuestReturnOrder, submitGuestReturnRequest } from '@/api/orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMe } from '@/hooks/use-auth';
import { useLocalePath } from '@/hooks/use-locale';
import { useTranslation } from '@/hooks/use-translation';
import type { Order } from '@/types/api';
import type {
    LookupFormState,
    OrderItemRowProps,
    ReturnRequestType,
    ReturnsPortalModuleProps,
    SelectedItemState,
} from './returns-portal-module.types';

function clampQuantity(value: number, max: number): number {
    return Math.min(Math.max(value, 1), max);
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (isAxiosError(error)) {
        return error.response?.data?.message ?? fallback;
    }
    return fallback;
}

function formatOrderDate(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(value));
}

function OrderItemRow({
    item,
    selectedQuantity,
    maxQuantity,
    disabled,
    onToggle,
    onQuantityChange,
}: OrderItemRowProps) {
    const { t } = useTranslation();
    const isSelected = typeof selectedQuantity === 'number';

    return (
        <li className="border-border/70 flex flex-col gap-3 rounded-2xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
                <label className="mt-0.5 flex items-center">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={disabled}
                        onChange={(event) =>
                            onToggle(item.id, event.target.checked)
                        }
                        className="border-input text-primary h-4 w-4 rounded"
                    />
                </label>
                <div>
                    <p className="text-sm font-medium">{item.product_name}</p>
                    <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                        {item.variant_sku && (
                            <span>
                                {t('returns.sku', 'SKU')}: {item.variant_sku}
                            </span>
                        )}
                        <span>
                            {t('returns.order_quantity', 'Ordered')}:{' '}
                            {item.quantity}
                        </span>
                        <span>
                            {t('returns.eligible_quantity', 'Eligible')}:{' '}
                            {maxQuantity}
                        </span>
                    </div>
                    {disabled && (
                        <p className="mt-2 text-xs text-amber-700">
                            {t(
                                'returns.item_not_eligible',
                                'This item is no longer eligible for a new return request.',
                            )}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <label
                    htmlFor={`return-item-${item.id}`}
                    className="text-muted-foreground text-xs font-medium"
                >
                    {t('returns.request_quantity', 'Request qty')}
                </label>
                <Input
                    id={`return-item-${item.id}`}
                    type="number"
                    min={1}
                    max={maxQuantity}
                    step={1}
                    value={selectedQuantity ?? 1}
                    disabled={!isSelected || disabled}
                    onChange={(event) =>
                        onQuantityChange(
                            item.id,
                            clampQuantity(
                                Number(event.target.value || 1),
                                maxQuantity,
                            ),
                        )
                    }
                    className="w-24"
                />
            </div>
        </li>
    );
}

export function ReturnsPortalModule({ page }: ReturnsPortalModuleProps) {
    const { t } = useTranslation();
    const lp = useLocalePath();
    const { data: user, isLoading: isUserLoading } = useMe();
    const [lookupForm, setLookupForm] = useState<LookupFormState>({
        reference_number: '',
        email: '',
    });
    const [lookupOrder, setLookupOrder] = useState<Order | null>(null);
    const [lookupStatus, setLookupStatus] = useState<
        'idle' | 'loading' | 'success' | 'error'
    >('idle');
    const [lookupError, setLookupError] = useState<string | null>(null);
    const [requestType, setRequestType] = useState<ReturnRequestType>('return');
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedItems, setSelectedItems] = useState<SelectedItemState>({});
    const [requestStatus, setRequestStatus] = useState<
        'idle' | 'loading' | 'success' | 'error'
    >('idle');
    const [requestMessage, setRequestMessage] = useState<string | null>(null);

    const itemCount = useMemo(
        () => Object.keys(selectedItems).length,
        [selectedItems],
    );

    async function handleLookupSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLookupStatus('loading');
        setLookupError(null);
        setRequestStatus('idle');
        setRequestMessage(null);

        try {
            const order = await lookupGuestReturnOrder({
                reference_number: lookupForm.reference_number.trim(),
                email: lookupForm.email.trim(),
            });

            if (!order) {
                setLookupStatus('error');
                setLookupError(
                    t(
                        'returns.lookup_empty',
                        'We could not find an order for that reference number and email address.',
                    ),
                );
                setLookupOrder(null);
                return;
            }

            setLookupOrder(order);
            setLookupStatus('success');

            if (order.items.length === 0) {
                setSelectedItems({});
            } else {
                setSelectedItems(
                    Object.fromEntries(
                        order.items
                            .filter(
                                (item) =>
                                    (item.return_eligibility
                                        ?.eligible_quantity ?? 0) > 0,
                            )
                            .map((item) => [item.id, 1]),
                    ) as SelectedItemState,
                );
            }
        } catch (error) {
            setLookupOrder(null);
            setLookupStatus('error');
            setLookupError(
                getErrorMessage(
                    error,
                    t(
                        'returns.lookup_error',
                        'We could not verify that order right now. Please try again.',
                    ),
                ),
            );
        }
    }

    function toggleItem(itemId: number, checked: boolean) {
        setSelectedItems((current) => {
            if (!checked) {
                const next = { ...current };
                delete next[itemId];
                return next;
            }

            const item = lookupOrder?.items.find(
                (entry) => entry.id === itemId,
            );
            if (!item) return current;
            if ((item.return_eligibility?.eligible_quantity ?? 0) < 1) {
                return current;
            }

            return {
                ...current,
                [itemId]: current[itemId] ?? 1,
            };
        });
    }

    function updateQuantity(itemId: number, quantity: number) {
        const item = lookupOrder?.items.find((entry) => entry.id === itemId);

        setSelectedItems((current) => ({
            ...current,
            [itemId]: clampQuantity(
                quantity,
                item?.return_eligibility?.eligible_quantity ?? 1,
            ),
        }));
    }

    async function handleRequestSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();
        if (!lookupOrder) return;

        const items = lookupOrder.items
            .filter((item) => selectedItems[item.id])
            .map((item) => ({
                order_item_id: item.id,
                quantity: clampQuantity(
                    selectedItems[item.id] ?? 1,
                    item.return_eligibility?.eligible_quantity ?? item.quantity,
                ),
            }));

        if (items.length === 0) {
            setRequestStatus('error');
            setRequestMessage(
                t(
                    'returns.select_items',
                    'Select at least one item before submitting the request.',
                ),
            );
            return;
        }

        setRequestStatus('loading');
        setRequestMessage(null);

        try {
            const result = await submitGuestReturnRequest({
                reference_number: lookupForm.reference_number.trim(),
                email: lookupForm.email.trim(),
                type: requestType,
                reason: reason.trim(),
                notes: notes.trim() || undefined,
                items,
            });

            setRequestStatus('success');
            setRequestMessage(
                result?.message ??
                    t(
                        'returns.request_success',
                        'Your return request has been submitted successfully.',
                    ),
            );
        } catch (error) {
            setRequestStatus('error');
            setRequestMessage(
                getErrorMessage(
                    error,
                    t(
                        'returns.request_error',
                        'We could not submit your request. Please review the form and try again.',
                    ),
                ),
            );
        }
    }

    function resetLookup() {
        setLookupOrder(null);
        setLookupStatus('idle');
        setLookupError(null);
        setRequestStatus('idle');
        setRequestMessage(null);
        setReason('');
        setNotes('');
        setRequestType('return');
        setSelectedItems({});
    }

    if (isUserLoading) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="bg-muted h-10 w-56 animate-pulse rounded-2xl" />
                <div className="bg-muted mt-6 h-64 animate-pulse rounded-3xl" />
            </div>
        );
    }

    if (user) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <p className="text-primary mb-2 text-sm font-semibold tracking-[0.22em] uppercase">
                        {t('returns.portal_label', 'Returns Portal')}
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                        {page.title}
                    </h1>
                    {page.excerpt && (
                        <p className="text-muted-foreground mt-4 max-w-2xl text-lg">
                            {page.excerpt}
                        </p>
                    )}
                </div>

                <div className="border-border bg-card relative overflow-hidden rounded-3xl border p-8 shadow-sm">
                    <div className="bg-primary/10 absolute inset-x-0 top-0 h-1" />
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="max-w-2xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
                                <ShieldCheck className="text-primary size-4" />
                                {t(
                                    'returns.logged_in_badge',
                                    'Signed-in customer',
                                )}
                            </div>
                            <h2 className="text-2xl font-semibold tracking-tight">
                                {t(
                                    'returns.logged_in_title',
                                    'Manage returns in your account panel',
                                )}
                            </h2>
                            <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-6">
                                {t(
                                    'returns.logged_in_copy',
                                    'Your authenticated returns flow lives in the account area. Use the panel to review existing requests and submit a new one without re-entering order data.',
                                )}
                            </p>
                        </div>
                        <Button asChild className="w-full md:w-auto">
                            <Link href={lp('/account/returns')}>
                                {t(
                                    'returns.account_cta',
                                    'Open /account/returns',
                                )}
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const hasOrder = !!lookupOrder;

    return (
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
                <div>
                    <p className="text-primary mb-2 text-sm font-semibold tracking-[0.22em] uppercase">
                        {t('returns.portal_label', 'Returns Portal')}
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                        {page.title}
                    </h1>
                    {page.excerpt && (
                        <p className="text-muted-foreground mt-4 max-w-2xl text-lg">
                            {page.excerpt}
                        </p>
                    )}
                </div>

                <div className="border-border bg-card rounded-3xl border p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-2xl">
                            <Search className="size-4" aria-hidden="true" />
                        </div>
                        <div>
                            <h2 className="font-semibold">
                                {t(
                                    'returns.lookup_title',
                                    'Find your order with reference number and email',
                                )}
                            </h2>
                            <p className="text-muted-foreground mt-1 text-sm leading-6">
                                {t(
                                    'returns.lookup_copy',
                                    'We will verify the order before opening the return request form.',
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <section className="border-border bg-card rounded-3xl border p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-semibold">
                                {t('returns.lookup_section', 'Order lookup')}
                            </h2>
                            <p className="text-muted-foreground mt-1 text-sm">
                                {t(
                                    'returns.lookup_section_copy',
                                    'Enter the exact order reference and the email used at checkout.',
                                )}
                            </p>
                        </div>
                        {hasOrder && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={resetLookup}
                            >
                                {t('returns.search_again', 'Search again')}
                            </Button>
                        )}
                    </div>

                    <form onSubmit={handleLookupSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="reference_number"
                                className="text-sm font-medium"
                            >
                                {t(
                                    'returns.reference_number',
                                    'Reference number',
                                )}
                            </label>
                            <Input
                                id="reference_number"
                                name="reference_number"
                                autoComplete="off"
                                value={lookupForm.reference_number}
                                onChange={(event) =>
                                    setLookupForm((current) => ({
                                        ...current,
                                        reference_number: event.target.value,
                                    }))
                                }
                                placeholder="ORD-12345"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium"
                            >
                                {t('returns.email', 'Email address')}
                            </label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={lookupForm.email}
                                onChange={(event) =>
                                    setLookupForm((current) => ({
                                        ...current,
                                        email: event.target.value,
                                    }))
                                }
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        {lookupError && (
                            <p
                                role="alert"
                                className="text-destructive text-sm"
                            >
                                {lookupError}
                            </p>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={lookupStatus === 'loading'}
                        >
                            {lookupStatus === 'loading' ? (
                                <Loader2
                                    className="size-4 animate-spin"
                                    aria-hidden="true"
                                />
                            ) : (
                                <Search className="size-4" aria-hidden="true" />
                            )}
                            {lookupStatus === 'loading'
                                ? t('returns.searching', 'Searching…')
                                : t('returns.search', 'Find order')}
                        </Button>
                    </form>

                    <div className="bg-muted/50 text-muted-foreground mt-5 rounded-2xl p-4 text-sm leading-6">
                        {t(
                            'returns.lookup_hint',
                            'If you do not see the order, double-check the order reference and the checkout email address. Guest requests are validated before submission.',
                        )}
                    </div>
                </section>

                <section className="border-border bg-card rounded-3xl border p-6 shadow-sm">
                    {!hasOrder ? (
                        <div className="flex h-full min-h-[20rem] flex-col justify-center">
                            <div className="bg-primary/10 text-primary mb-4 flex size-12 items-center justify-center rounded-2xl">
                                <Package
                                    className="size-5"
                                    aria-hidden="true"
                                />
                            </div>
                            <h2 className="text-xl font-semibold">
                                {t(
                                    'returns.summary_empty_title',
                                    'Your order summary will appear here',
                                )}
                            </h2>
                            <p className="text-muted-foreground mt-2 max-w-lg text-sm leading-6">
                                {t(
                                    'returns.summary_empty_copy',
                                    'Once we find the order, you can choose items, describe the reason, and submit the request in the same flow.',
                                )}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                    <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
                                        {t(
                                            'returns.found_badge',
                                            'Order verified',
                                        )}
                                    </span>
                                    <span className="text-muted-foreground text-xs font-medium tracking-[0.18em] uppercase">
                                        {formatOrderDate(
                                            lookupOrder.created_at,
                                        )}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-semibold">
                                    #{lookupOrder.reference_number}
                                </h2>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    {t('returns.status', 'Status')}:{' '}
                                    {lookupOrder.status_label ??
                                        lookupOrder.status.replace(/_/g, ' ')}
                                </p>
                            </div>

                            <div className="border-border rounded-2xl border p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <h3 className="font-medium">
                                        {t(
                                            'returns.items_title',
                                            'Select items',
                                        )}
                                    </h3>
                                    <span className="text-muted-foreground text-xs">
                                        {itemCount}{' '}
                                        {t('returns.selected', 'selected')}
                                    </span>
                                </div>
                                {lookupOrder.return_eligibility &&
                                    lookupOrder.return_eligibility
                                        .blocked_reasons.length > 0 && (
                                        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                                            {t(
                                                'returns.order_not_fully_eligible',
                                                'Some request types may be unavailable for this order.',
                                            )}
                                        </div>
                                    )}

                                {lookupOrder.items.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">
                                        {t(
                                            'returns.no_items',
                                            'This order does not contain any items that can be selected.',
                                        )}
                                    </p>
                                ) : (
                                    <ul className="space-y-3">
                                        {lookupOrder.items.map((item) => (
                                            <OrderItemRow
                                                key={item.id}
                                                item={item}
                                                selectedQuantity={
                                                    selectedItems[item.id]
                                                }
                                                maxQuantity={
                                                    item.return_eligibility
                                                        ?.eligible_quantity ??
                                                    item.quantity
                                                }
                                                disabled={
                                                    (item.return_eligibility
                                                        ?.eligible_quantity ??
                                                        0) < 1
                                                }
                                                onToggle={toggleItem}
                                                onQuantityChange={
                                                    updateQuantity
                                                }
                                            />
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <form
                                onSubmit={handleRequestSubmit}
                                className="space-y-5"
                            >
                                <div className="grid gap-4 sm:grid-cols-3">
                                    {(
                                        [
                                            [
                                                'return',
                                                t(
                                                    'returns.type_return',
                                                    'Return',
                                                ),
                                            ],
                                            [
                                                'exchange',
                                                t(
                                                    'returns.type_exchange',
                                                    'Exchange',
                                                ),
                                            ],
                                            [
                                                'complaint',
                                                t(
                                                    'returns.type_complaint',
                                                    'Complaint',
                                                ),
                                            ],
                                        ] as const
                                    ).map(([value, label]) => (
                                        <label
                                            key={value}
                                            className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-colors ${
                                                requestType === value
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:bg-accent/50'
                                            }`}
                                        >
                                            <span className="font-medium">
                                                {label}
                                            </span>
                                            <input
                                                type="radio"
                                                name="return_type"
                                                value={value}
                                                checked={requestType === value}
                                                disabled={
                                                    !lookupOrder.return_eligibility?.eligible_types.includes(
                                                        value,
                                                    )
                                                }
                                                onChange={() =>
                                                    setRequestType(value)
                                                }
                                                className="text-primary"
                                            />
                                        </label>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="reason"
                                        className="text-sm font-medium"
                                    >
                                        {t('returns.reason', 'Reason')}
                                    </label>
                                    <Textarea
                                        id="reason"
                                        name="reason"
                                        value={reason}
                                        onChange={(event) =>
                                            setReason(event.target.value)
                                        }
                                        rows={4}
                                        required
                                        placeholder={t(
                                            'returns.reason_placeholder',
                                            'Describe the defect, mismatch, or other reason for the request.',
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="notes"
                                        className="text-sm font-medium"
                                    >
                                        {t('returns.notes', 'Additional notes')}
                                    </label>
                                    <Textarea
                                        id="notes"
                                        name="notes"
                                        value={notes}
                                        onChange={(event) =>
                                            setNotes(event.target.value)
                                        }
                                        rows={3}
                                        placeholder={t(
                                            'returns.notes_placeholder',
                                            'Optional: preferred resolution, return packaging details, or any context that helps support.',
                                        )}
                                    />
                                </div>

                                {requestMessage && (
                                    <div
                                        role={
                                            requestStatus === 'success'
                                                ? 'status'
                                                : 'alert'
                                        }
                                        className={`rounded-2xl border p-4 text-sm ${
                                            requestStatus === 'success'
                                                ? 'border-green-200 bg-green-50 text-green-800'
                                                : 'border-red-200 bg-red-50 text-red-800'
                                        }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            {requestStatus === 'success' ? (
                                                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                                            ) : null}
                                            <p>{requestMessage}</p>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={
                                        requestStatus === 'loading' ||
                                        requestStatus === 'success' ||
                                        lookupOrder.items.length === 0 ||
                                        itemCount === 0
                                    }
                                >
                                    {requestStatus === 'loading' ? (
                                        <Loader2
                                            className="size-4 animate-spin"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <ShieldCheck
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    )}
                                    {requestStatus === 'loading'
                                        ? t('returns.submitting', 'Submitting…')
                                        : t('returns.submit', 'Submit request')}
                                </Button>
                            </form>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
