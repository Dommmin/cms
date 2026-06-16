/** Whitelist of color token keys injectable from DB theme (security gate). */
export const ALLOWED_THEME_COLOR_KEYS = [
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
    'accent-vivid',
    'accent-vivid-foreground',
    'card-elevated',
] as const;

const TOKEN_VALUE_PATTERN = /^[#(),.%\-\sa-zA-Z0-9]+$/;

export function isAllowedThemeTokenValue(value: string): boolean {
    return (
        value.length > 0 &&
        value.length <= 100 &&
        TOKEN_VALUE_PATTERN.test(value)
    );
}

export function sanitizeThemeColorTokens(
    tokens: Record<string, string> | null | undefined,
): Record<string, string> {
    if (!tokens) {
        return {};
    }

    const sanitized: Record<string, string> = {};

    for (const key of ALLOWED_THEME_COLOR_KEYS) {
        const value = tokens[key];
        if (typeof value === 'string' && isAllowedThemeTokenValue(value)) {
            sanitized[key] = value;
        }
    }

    return sanitized;
}
