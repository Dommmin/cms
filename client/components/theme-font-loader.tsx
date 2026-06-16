import type { ActiveTheme } from '@/app/layout.types';

export type ThemeFontSource = {
    family: string;
    source: 'google' | 'system' | 'custom';
    weights?: string[];
    url?: string;
};

export type ThemeFontSources = {
    heading?: ThemeFontSource;
    body?: ThemeFontSource;
};

function buildGoogleFontsHref(sources: ThemeFontSources): string | null {
    const families: string[] = [];

    for (const slot of ['heading', 'body'] as const) {
        const entry = sources[slot];
        if (!entry || entry.source !== 'google' || !entry.family) {
            continue;
        }

        const weights = entry.weights?.length
            ? entry.weights.join(';')
            : '400;500;600;700';
        const family = entry.family.replace(/\s+/g, '+');
        families.push(`family=${family}:wght@${weights}`);
    }

    if (families.length === 0) {
        return null;
    }

    return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
}

export function ThemeFontLoader({ theme }: { theme: ActiveTheme | null }) {
    const fontSources = theme?.font_sources;
    if (!fontSources) {
        return null;
    }

    const href = buildGoogleFontsHref(fontSources);
    if (!href) {
        return null;
    }

    return <link rel="stylesheet" href={href} />;
}
