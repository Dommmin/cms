import type { JSX } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { ToolbarButtonProps, ToolbarToggleProps } from './types';

export function ToolbarButton({ onClick, disabled, tooltip, children, className = '' }: ToolbarButtonProps): JSX.Element {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 ${className}`}
                    onClick={onClick}
                    disabled={disabled}
                    aria-label={tooltip}
                >
                    {children}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
                {tooltip}
            </TooltipContent>
        </Tooltip>
    );
}

export function ToolbarToggle({ pressed, onPressedChange, tooltip, children, className = '' }: ToolbarToggleProps): JSX.Element {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Toggle
                    type="button"
                    size="sm"
                    className={`h-7 w-7 p-0 ${className}`}
                    pressed={pressed}
                    onPressedChange={onPressedChange}
                    aria-label={tooltip}
                >
                    {children}
                </Toggle>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
                {tooltip}
            </TooltipContent>
        </Tooltip>
    );
}

export function ToolbarSeparator(): JSX.Element {
    return <Separator orientation="vertical" className="mx-1 h-5" />;
}
