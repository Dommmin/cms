import type { ActiveTheme } from '@/app/layout.types';

import { sanitizeThemeColorTokens } from './theme-token-keys';

function appendColorVars(
    vars: string[],
    tokens: Record<string, string> | null | undefined,
): void {
    const sanitized = sanitizeThemeColorTokens(tokens);
    for (const [key, value] of Object.entries(sanitized)) {
        vars.push(`--${key}: ${value};`);
    }
}

export function buildThemeCss(theme: ActiveTheme): {
    root: string;
    dark: string;
} {
    const rootVars: string[] = [];
    const darkVars: string[] = [];

    appendColorVars(rootVars, theme.tokens);
    appendColorVars(darkVars, theme.dark_tokens);

    if (theme.typography) {
        const typoMap: Record<string, string> = {
            heading_font: 'font-heading',
            body_font: 'font-body',
            base_size: 'text-base-size',
            scale: 'text-scale',
            h1_size: 'h1-size',
            h2_size: 'h2-size',
            h3_size: 'h3-size',
            h4_size: 'h4-size',
        };
        for (const [key, cssVar] of Object.entries(typoMap)) {
            const value =
                theme.typography[key as keyof typeof theme.typography];
            if (value) {
                rootVars.push(`--${cssVar}: ${value};`);
            }
        }
    }

    if (theme.spacing) {
        const spacingMap: Record<string, string> = {
            section_padding: 'section-padding-y',
            block_gap: 'block-gap',
            container_padding: 'container-padding',
        };
        for (const [key, cssVar] of Object.entries(spacingMap)) {
            const value = theme.spacing[key as keyof typeof theme.spacing];
            if (value) {
                rootVars.push(`--${cssVar}: ${value};`);
            }
        }
    }

    if (theme.buttons) {
        const btnMap: Record<string, string> = {
            primary_border_radius: 'btn-radius',
            primary_padding_x: 'btn-padding-x',
            primary_padding_y: 'btn-padding-y',
            secondary_border_radius: 'btn-secondary-radius',
            secondary_padding_x: 'btn-secondary-padding-x',
            secondary_padding_y: 'btn-secondary-padding-y',
        };
        for (const [key, cssVar] of Object.entries(btnMap)) {
            const value = theme.buttons[key as keyof typeof theme.buttons];
            if (value) {
                rootVars.push(`--${cssVar}: ${value};`);
            }
        }
    }

    if (theme.containers) {
        const cntMap: Record<string, string> = {
            max_width: 'container-max-width',
            content_width: 'container-content-width',
            narrow_width: 'container-narrow-width',
        };
        for (const [key, cssVar] of Object.entries(cntMap)) {
            const value =
                theme.containers[key as keyof typeof theme.containers];
            if (value) {
                rootVars.push(`--${cssVar}: ${value};`);
                if (key === 'max_width') {
                    rootVars.push(`--store-shell-width: ${value};`);
                }
            }
        }
    }

    const fg = theme.tokens?.foreground ?? '';
    const bg = theme.tokens?.background ?? '';
    if (fg) {
        rootVars.push(`--section-dark-bg: ${fg};`);
    }
    if (bg) {
        rootVars.push(`--section-dark-text: ${bg};`);
    }

    const darkFg = theme.dark_tokens?.foreground ?? '';
    const darkBg = theme.dark_tokens?.background ?? '';
    if (darkFg) {
        darkVars.push(`--section-dark-bg: ${darkFg};`);
    }
    if (darkBg) {
        darkVars.push(`--section-dark-text: ${darkBg};`);
    }

    const radius = theme.tokens?.radius;
    if (typeof radius === 'string' && radius.length > 0) {
        rootVars.push(`--store-card-radius: ${radius};`);
    }

    return {
        root: rootVars.join(' '),
        dark: darkVars.join(' '),
    };
}
