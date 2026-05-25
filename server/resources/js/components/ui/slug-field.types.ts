import type { SharedLocale } from '@/types/global';

export interface SlugFieldProps {
    label?: string;
    name?: string;
    value: Record<string, string>;
    onChange: (value: Record<string, string>) => void;
    locales: SharedLocale[];
    errors?: Record<string, string>;
    required?: boolean;
    id?: string;
}
