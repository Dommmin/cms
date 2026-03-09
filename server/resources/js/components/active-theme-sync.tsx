import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

type ActiveTheme = {
    id: number;
    slug: string;
    tokens?: Record<string, string> | null;
};

const ALLOWED_THEME_TOKENS = [
    'background',
    'foreground',
    'card',
    'card-foreground',
    'popover',
    'popover-foreground',
    'primary',
    'primary-foreground',
    'secondary',
    'secondary-foreground',
    'muted',
    'muted-foreground',
    'accent',
    'accent-foreground',
    'destructive',
    'destructive-foreground',
    'border',
    'input',
    'ring',
    'radius',
    'chart-1',
    'chart-2',
    'chart-3',
    'chart-4',
    'chart-5',
    'sidebar',
    'sidebar-foreground',
    'sidebar-primary',
    'sidebar-primary-foreground',
    'sidebar-accent',
    'sidebar-accent-foreground',
    'sidebar-border',
    'sidebar-ring',
] as const;

const ALLOWED_SET = new Set<string>(ALLOWED_THEME_TOKENS);

export default function ActiveThemeSync() {
    const { props } = usePage<{ activeTheme?: ActiveTheme | null }>();
    const slug = props.activeTheme?.slug ?? '';
    const tokens = props.activeTheme?.tokens ?? null;

    useEffect(() => {
        for (const token of ALLOWED_THEME_TOKENS) {
            document.documentElement.style.removeProperty(`--${token}`);
        }

        if (!tokens) {
            return;
        }

        for (const [rawKey, rawValue] of Object.entries(tokens)) {
            const key = rawKey.replace(/^--+/, '').trim();

            if (!ALLOWED_SET.has(key)) {
                continue;
            }

            const value = String(rawValue ?? '').trim();

            if (!value || value.length > 100) {
                continue;
            }

            if (!/^[#(),.%\-\sa-zA-Z0-9]+$/.test(value)) {
                continue;
            }

            document.documentElement.style.setProperty(`--${key}`, value);
        }
    }, [tokens]);

    useEffect(() => {
        if (tokens) {
            document.documentElement.setAttribute('data-theme-active', '1');
            document.documentElement.setAttribute('data-theme-slug', slug);
            return;
        }

        document.documentElement.setAttribute('data-theme-active', '0');
        document.documentElement.removeAttribute('data-theme-slug');
    }, [slug, tokens]);

    return null;
}
