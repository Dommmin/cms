'use client';

import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

export interface MergeDialogState {
    cartCount: number;
    wishlistCount: number;
}

interface MergeDialogProps {
    open: boolean;
    state: MergeDialogState | null;
    onConfirm: (mergeCart: boolean, mergeWishlist: boolean) => void;
}

export function MergeDialog({ open, state, onConfirm }: MergeDialogProps) {
    const { t } = useTranslation();
    const dialogRef = useRef<HTMLDivElement>(null);

    // Move focus into the dialog when it opens
    useEffect(() => {
        if (open && dialogRef.current) {
            const firstFocusable = dialogRef.current.querySelector<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            );
            firstFocusable?.focus();
        }
    }, [open]);

    if (!open || !state) return null;

    const hasCart = state.cartCount > 0;
    const hasWishlist = state.wishlistCount > 0;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="merge-dialog-title"
            aria-describedby="merge-dialog-desc"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Panel */}
            <div
                ref={dialogRef}
                className="bg-background border-border relative w-full max-w-md rounded-2xl border p-6 shadow-2xl"
            >
                {/* Icon */}
                <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-6"
                        aria-hidden="true"
                    >
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                        <line x1="3" x2="21" y1="6" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                </div>

                <h2
                    id="merge-dialog-title"
                    className="mb-2 text-center text-lg font-semibold"
                >
                    {t('merge.title', 'You have saved items')}
                </h2>
                <p
                    id="merge-dialog-desc"
                    className="text-muted-foreground mb-5 text-center text-sm"
                >
                    {t(
                        'merge.desc',
                        'Would you like to keep the items you added before signing in?',
                    )}
                </p>

                {/* Summary rows */}
                <div className="border-border mb-5 divide-y rounded-xl border">
                    {hasCart && (
                        <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-2.5">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-muted-foreground size-4 shrink-0"
                                    aria-hidden="true"
                                >
                                    <circle cx="8" cy="21" r="1" />
                                    <circle cx="19" cy="21" r="1" />
                                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                                </svg>
                                <span className="text-sm font-medium">
                                    {t('merge.cart', 'Cart')}
                                </span>
                                <span className="text-muted-foreground text-sm">
                                    {t(
                                        'merge.items_count',
                                        '{{count}} item(s)',
                                    ).replace(
                                        '{{count}}',
                                        String(state.cartCount),
                                    )}
                                </span>
                            </div>
                        </div>
                    )}
                    {hasWishlist && (
                        <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-2.5">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-muted-foreground size-4 shrink-0"
                                    aria-hidden="true"
                                >
                                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                </svg>
                                <span className="text-sm font-medium">
                                    {t('merge.wishlist', 'Wishlist')}
                                </span>
                                <span className="text-muted-foreground text-sm">
                                    {t(
                                        'merge.items_count',
                                        '{{count}} item(s)',
                                    ).replace(
                                        '{{count}}',
                                        String(state.wishlistCount),
                                    )}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
                    <Button
                        id="merge-dialog-confirm"
                        className="flex-1"
                        onClick={() => onConfirm(hasCart, hasWishlist)}
                    >
                        {t('merge.keep', 'Keep items')}
                    </Button>
                    <Button
                        id="merge-dialog-discard"
                        variant="outline"
                        className="flex-1"
                        onClick={() => onConfirm(false, false)}
                    >
                        {t('merge.discard', 'Discard')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
