'use client';

import { Copy, Loader2, Share2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { useLocalePath } from '@/hooks/use-locale';
import { useCreateSharedCart } from '@/hooks/use-shared-cart';
import { useTranslation } from '@/hooks/use-translation';
import type { ShareCartDialogProps } from './share-cart-dialog.types';

export function ShareCartDialog({ open, onClose }: ShareCartDialogProps) {
    const { t } = useTranslation();
    const lp = useLocalePath();
    const dialogRef = useRef<HTMLDivElement>(null);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const { mutate: createLink, isPending, reset } = useCreateSharedCart();

    useEffect(() => {
        if (!open) {
            return;
        }

        const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        firstFocusable?.focus();

        if (shareUrl || isPending) {
            return;
        }

        createLink(undefined, {
            onSuccess: ({ token }) => {
                if (typeof window === 'undefined') {
                    return;
                }

                setShareUrl(
                    `${window.location.origin}${lp(`/cart/shared/${token}`)}`,
                );
            },
            onError: () => {
                toast.error(
                    t(
                        'cart.share_create_error',
                        'Could not generate a shared cart link.',
                    ),
                );
            },
        });
    }, [createLink, isPending, lp, open, shareUrl, t]);

    if (!open) {
        return null;
    }

    async function handleCopy(): Promise<void> {
        if (!shareUrl) {
            return;
        }

        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success(
                t('cart.share_link_copied', 'Shared cart link copied.'),
            );
        } catch {
            toast.error(
                t('cart.share_copy_error', 'Could not copy the shared link.'),
            );
        }
    }

    function handleClose(): void {
        onClose();
        reset();
        setShareUrl(null);
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-cart-title"
            aria-describedby="share-cart-desc"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />
            <div
                ref={dialogRef}
                className="bg-background border-border relative z-10 w-full max-w-lg rounded-2xl border p-6 shadow-2xl"
            >
                <button
                    onClick={handleClose}
                    className="text-muted-foreground hover:text-foreground absolute top-4 right-4"
                    aria-label={t('common.close', 'Close')}
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>

                <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                    <Share2 className="h-6 w-6" aria-hidden="true" />
                </div>

                <h2
                    id="share-cart-title"
                    className="mb-2 text-xl font-semibold"
                >
                    {t('cart.share_title', 'Share this cart')}
                </h2>
                <p
                    id="share-cart-desc"
                    className="text-muted-foreground mb-5 text-sm"
                >
                    {t(
                        'cart.share_desc',
                        'Generate a snapshot link that others can preview and import into their own cart.',
                    )}
                </p>

                <div className="border-border bg-muted/30 space-y-3 rounded-xl border p-4">
                    <p className="text-sm font-medium">
                        {t('cart.share_link', 'Shared link')}
                    </p>
                    {isPending && (
                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t('cart.share_generating', 'Generating link...')}
                        </div>
                    )}
                    {!isPending && shareUrl && (
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <input
                                readOnly
                                value={shareUrl}
                                className="border-input bg-background flex-1 rounded-md border px-3 py-2 text-sm"
                                aria-label={t('cart.share_link', 'Shared link')}
                            />
                            <Button onClick={() => void handleCopy()}>
                                <Copy className="h-4 w-4" aria-hidden="true" />
                                {t('common.copy', 'Copy')}
                            </Button>
                        </div>
                    )}
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button variant="outline" onClick={handleClose}>
                        {t('common.close', 'Close')}
                    </Button>
                    <Button
                        onClick={() => {
                            reset();
                            setShareUrl(null);
                        }}
                        disabled={isPending}
                    >
                        {t('cart.share_regenerate', 'Regenerate link')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
