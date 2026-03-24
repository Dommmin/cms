import { type JSX } from 'react';
import { cn } from '@/lib/utils';
import type { TextInputProps } from './TextInput.types';

export default function TextInput({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    className,
}: TextInputProps): JSX.Element {
    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <label className="text-sm font-medium text-foreground">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors outline-none focus:ring-1 focus:ring-ring"
            />
        </div>
    );
}
