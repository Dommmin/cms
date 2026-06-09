import { router } from '@inertiajs/react';
import type { MouseEvent } from 'react';
import { useCallback, useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import type {
    ConfirmButtonProps,
    ConfirmDialogProps,
} from './confirm-dialog.types';

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    confirmUrl,
    confirmMethod = 'delete',
    confirmLabel,
    cancelLabel,
    variant = 'default',
}: ConfirmDialogProps) {
    const [loading, setLoading] = useState(false);
    const __ = useTranslation();

    const displayTitle = title ?? __('dialog.are_you_sure', 'Are you sure?');
    const displayDescription =
        description ??
        __('dialog.cannot_be_undone', 'This action cannot be undone.');
    const displayConfirmLabel =
        confirmLabel ?? __('dialog.confirm_label', 'Confirm');
    const displayCancelLabel =
        cancelLabel ?? __('dialog.cancel_label', 'Cancel');

    const handleConfirm = useCallback(async () => {
        setLoading(true);

        if (onConfirm) {
            onConfirm();
            onOpenChange(false);
            setLoading(false);
            return;
        }

        if (confirmUrl) {
            router.visit(confirmUrl, {
                method: confirmMethod,
                onFinish: () => {
                    setLoading(false);
                    onOpenChange(false);
                },
            });
            return;
        }

        setLoading(false);
        onOpenChange(false);
    }, [onConfirm, confirmUrl, confirmMethod, onOpenChange]);

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{displayTitle}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {displayDescription}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>
                        {displayCancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e: MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault();
                            handleConfirm();
                        }}
                        disabled={loading}
                        className={
                            variant === 'destructive'
                                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                : ''
                        }
                    >
                        {loading
                            ? __('misc.processing', 'Processing...')
                            : displayConfirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export function ConfirmButton({
    onConfirm,
    title,
    description,
    confirmLabel,
    cancelLabel,
    variant = 'outline',
    size = 'default',
    disabled = false,
    className,
    children,
}: ConfirmButtonProps) {
    const [open, setOpen] = useState(false);
    const __ = useTranslation();

    const displayTitle = title ?? __('dialog.are_you_sure', 'Are you sure?');
    const displayDescription =
        description ??
        __('dialog.cannot_be_undone', 'This action cannot be undone.');
    const displayConfirmLabel =
        confirmLabel ?? __('dialog.confirm_label', 'Confirm');
    const displayCancelLabel =
        cancelLabel ?? __('dialog.cancel_label', 'Cancel');

    return (
        <>
            <Button
                variant={variant}
                size={size}
                disabled={disabled}
                onClick={() => setOpen(true)}
                className={className}
            >
                {children}
            </Button>
            <ConfirmDialog
                open={open}
                onOpenChange={setOpen}
                title={displayTitle}
                description={displayDescription}
                onConfirm={onConfirm}
                confirmLabel={displayConfirmLabel}
                cancelLabel={displayCancelLabel}
                variant="destructive"
            />
        </>
    );
}
