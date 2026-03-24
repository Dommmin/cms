import { type JSX } from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import ColorPicker from './ColorPicker';
import type { DropdownColorPickerProps } from './DropdownColorPicker.types';

export default function DropdownColorPicker({
    color,
    onChange,
    children,
    disabled,
    className,
    tooltip,
}: DropdownColorPickerProps): JSX.Element {
    return (
        <Popover>
            {tooltip ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild disabled={disabled}>
                            <button
                                type="button"
                                disabled={disabled}
                                className={cn(
                                    'flex h-8 items-center gap-1 rounded px-1.5 text-sm hover:bg-accent disabled:opacity-50',
                                    className,
                                )}
                            >
                                {children}
                                <div
                                    className="mt-0.5 h-1 w-4 rounded-sm"
                                    style={{ background: color }}
                                />
                            </button>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            ) : (
                <PopoverTrigger asChild disabled={disabled}>
                    <button
                        type="button"
                        disabled={disabled}
                        className={cn(
                            'flex h-8 items-center gap-1 rounded px-1.5 text-sm hover:bg-accent disabled:opacity-50',
                            className,
                        )}
                    >
                        {children}
                        <div
                            className="mt-0.5 h-1 w-4 rounded-sm"
                            style={{ background: color }}
                        />
                    </button>
                </PopoverTrigger>
            )}
            <PopoverContent
                className="w-auto p-0"
                align="start"
                onFocusOutside={(e) => {
                    // editor.update() inside onChange causes the contenteditable to
                    // steal focus — prevent that from closing the color picker
                    const target = e.target as HTMLElement | null;
                    if (target?.closest?.('[contenteditable]')) {
                        e.preventDefault();
                    }
                }}
            >
                <ColorPicker color={color} onChange={onChange} />
            </PopoverContent>
        </Popover>
    );
}
