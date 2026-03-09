import * as React from 'react';
import type { InputHTMLAttributes } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    hint?: string;
    wrapperClassName?: string;
}

export const InputField = React.forwardRef<HTMLInputElement, FormFieldProps>(
    (
        { label, error, hint, className, wrapperClassName, id, ...props },
        ref,
    ) => {
        const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className={cn('grid gap-2', wrapperClassName)}>
                <Label htmlFor={inputId}>{label}</Label>
                <input
                    id={inputId}
                    className={cn(
                        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                        error &&
                            'border-destructive focus-visible:ring-destructive',
                        className,
                    )}
                    ref={ref}
                    {...props}
                />
                {hint && !error && (
                    <p className="text-xs text-muted-foreground">{hint}</p>
                )}
                {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
        );
    },
);

InputField.displayName = 'InputField';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    error?: string;
    hint?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
    wrapperClassName?: string;
}

export const SelectField = React.forwardRef<
    HTMLSelectElement,
    SelectFieldProps
>(
    (
        {
            label,
            error,
            hint,
            options,
            placeholder,
            className,
            wrapperClassName,
            id,
            ...props
        },
        ref,
    ) => {
        const selectId = id || label.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className={cn('grid gap-2', wrapperClassName)}>
                <Label htmlFor={selectId}>{label}</Label>
                <select
                    id={selectId}
                    className={cn(
                        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                        error &&
                            'border-destructive focus-visible:ring-destructive',
                        className,
                    )}
                    ref={ref}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {hint && !error && (
                    <p className="text-xs text-muted-foreground">{hint}</p>
                )}
                {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
        );
    },
);

SelectField.displayName = 'SelectField';

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
    hint?: string;
    wrapperClassName?: string;
}

export const TextareaField = React.forwardRef<
    HTMLTextAreaElement,
    TextareaFieldProps
>(({ label, error, hint, className, wrapperClassName, id, ...props }, ref) => {
    const textareaId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className={cn('grid gap-2', wrapperClassName)}>
            <Label htmlFor={textareaId}>{label}</Label>
            <textarea
                id={textareaId}
                className={cn(
                    'flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                    error &&
                        'border-destructive focus-visible:ring-destructive',
                    className,
                )}
                ref={ref}
                {...props}
            />
            {hint && !error && (
                <p className="text-xs text-muted-foreground">{hint}</p>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
});

TextareaField.displayName = 'TextareaField';

interface CheckboxFieldProps extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type'
> {
    label: string;
    error?: string;
    wrapperClassName?: string;
}

export const CheckboxField = React.forwardRef<
    HTMLInputElement,
    CheckboxFieldProps
>(({ label, error, className, wrapperClassName, id, ...props }, ref) => {
    const checkboxId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className={cn('flex items-center gap-2', wrapperClassName)}>
            <input
                type="checkbox"
                id={checkboxId}
                className={cn(
                    'h-4 w-4 rounded border-input text-primary focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none',
                    error && 'border-destructive',
                    className,
                )}
                ref={ref}
                {...props}
            />
            <Label htmlFor={checkboxId} className="font-normal">
                {label}
            </Label>
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
});

CheckboxField.displayName = 'CheckboxField';
