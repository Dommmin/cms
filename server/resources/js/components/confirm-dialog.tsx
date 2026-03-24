import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import type { MouseEvent } from 'react';
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
import type { ConfirmDialogProps, ConfirmButtonProps } from './confirm-dialog.types';

export function ConfirmDialog({
    open,
    onOpenChange,
    title = 'Are you sure?',
    description = 'This action cannot be undone.',
    onConfirm,
    confirmUrl,
    confirmMethod = 'delete',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'default',
}: ConfirmDialogProps) {
    const [loading, setLoading] = useState(false);

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
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>
                        {cancelLabel}
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
                        {loading ? 'Processing...' : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export function ConfirmButton({
    onConfirm,
    title = 'Are you sure?',
    description = 'This action cannot be undone.',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'outline',
    size = 'default',
    disabled = false,
    className,
    children,
}: ConfirmButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                variant="outline"
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
                title={title}
                description={description}
                onConfirm={onConfirm}
                confirmLabel={confirmLabel}
                cancelLabel={cancelLabel}
                variant={variant}
            />
        </>
    );
}
