import { ChevronDown } from 'lucide-react';
import { type JSX } from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DropDownItemProps {
    className?: string;
    onClick: () => void;
    title?: string;
    children: React.ReactNode;
    active?: boolean;
}

export function DropDownItem({
    className,
    onClick,
    title,
    children,
    active,
}: DropDownItemProps): JSX.Element {
    return (
        <button
            type="button"
            className={cn(
                'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-accent',
                active && 'bg-accent',
                className,
            )}
            title={title}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

interface DropDownProps {
    label: React.ReactNode;
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
    buttonClassName?: string;
    buttonAriaLabel?: string;
    tooltip?: string;
}

export default function DropDown({
    label,
    children,
    disabled,
    className,
    buttonClassName,
    buttonAriaLabel,
    tooltip,
}: DropDownProps): JSX.Element {
    return (
        <Popover>
            <PopoverTrigger asChild disabled={disabled}>
                <button
                    type="button"
                    aria-label={buttonAriaLabel}
                    title={tooltip}
                    className={cn(
                        'flex h-8 items-center gap-1 rounded px-2 text-sm select-none hover:bg-accent disabled:opacity-50',
                        buttonClassName,
                    )}
                >
                    {label}
                    <ChevronDown className="h-3 w-3 opacity-60" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                className={cn('w-auto min-w-[160px] p-1', className)}
                align="start"
            >
                <div className="flex flex-col">{children}</div>
            </PopoverContent>
        </Popover>
    );
}
