import type { ReactNode } from 'react';

export interface LocalizedFieldProps {
    label: string;
    value: Record<string, string>;
    onChange: (value: Record<string, string>) => void;
    /** Defaults to 'input'. */
    type?: 'input' | 'textarea' | 'richtext' | 'markdown';
    placeholder?: string;
    required?: boolean;
    /**
     * Field name used to look up errors and render hidden inputs for form submission
     * (`name[locale]`). Supports `errors[name]` and `errors["name.en"]`.
     */
    name?: string;
    errors?: Record<string, string>;
    rows?: number;
    id?: string;
    /** Rendered beside the locale tab switcher (e.g. content type select). */
    headerEnd?: ReactNode;
    /** Hide the visible label (use when the parent renders its own). */
    hideLabel?: boolean;
    /** Lexical JSON per locale — used with `type="richtext"` and `onJsonChange`. */
    jsonValue?: Record<string, string>;
    onJsonChange?: (value: Record<string, string>) => void;
    autoFocus?: boolean;
    localeSwitcherClassName?: string;
}
