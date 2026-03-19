export type LocalizedText = string | Record<string, string> | null | undefined;

export function resolveLocalizedText(
    value: LocalizedText,
    preferredLocale = 'en',
): string {
    if (typeof value === 'string') {
        return value;
    }

    if (!value || typeof value !== 'object') {
        return '';
    }

    return (
        value[preferredLocale] ??
        Object.values(value).find(
            (text) => typeof text === 'string' && text.trim().length > 0,
        ) ??
        ''
    );
}
