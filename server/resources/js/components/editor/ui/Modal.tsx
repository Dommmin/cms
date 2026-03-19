import { type JSX } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Props {
    onClose: () => void;
    children: React.ReactNode;
    title: string;
    closeOnClickOutside?: boolean;
    className?: string;
}

export default function Modal({
    onClose,
    children,
    title,
    closeOnClickOutside = false,
    className,
}: Props): JSX.Element {
    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent
                className={className}
                onInteractOutside={(e) => {
                    if (!closeOnClickOutside) e.preventDefault();
                }}
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
}
