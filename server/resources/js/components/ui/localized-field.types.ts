export interface LocalizedFieldProps {
    label: string;
    value: Record<string, string>;
    onChange: (value: Record<string, string>) => void;
    /** Defaults to 'input'. */
    type?: 'input' | 'textarea' | 'richtext' | 'markdown';
    placeholder?: string;
    required?: boolean;
    /**
     * Field name used to look up errors.
     * Supports both `errors[name]` (top-level) and `errors["name.en"]` (per-locale).
     */
    name?: string;
    errors?: Record<string, string>;
    rows?: number;
    id?: string;
}
