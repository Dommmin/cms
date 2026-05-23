import type { ActiveTheme } from '@/app/layout.types';

const ALLOWED_COLOR_KEYS = [
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

function buildCssVariables(theme: ActiveTheme): string {
    const vars: string[] = [];

    // Color tokens
    if (theme.tokens) {
        for (const key of ALLOWED_COLOR_KEYS) {
            const value = theme.tokens[key];
            if (value && typeof value === 'string' && value.length <= 100) {
                vars.push(`--${key}: ${value};`);
            }
        }
    }

    // Typography tokens
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
            if (value) vars.push(`--${cssVar}: ${value};`);
        }
    }

    // Spacing tokens
    if (theme.spacing) {
        const spacingMap: Record<string, string> = {
            section_padding: 'section-padding-y',
            block_gap: 'block-gap',
            container_padding: 'container-padding',
        };
        for (const [key, cssVar] of Object.entries(spacingMap)) {
            const value = theme.spacing[key as keyof typeof theme.spacing];
            if (value) vars.push(`--${cssVar}: ${value};`);
        }
    }

    // Button tokens
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
            if (value) vars.push(`--${cssVar}: ${value};`);
        }
    }

    // Container tokens
    if (theme.containers) {
        const cntMap: Record<string, string> = {
            max_width: 'container-max-width',
            content_width: 'container-content-width',
            narrow_width: 'container-narrow-width',
        };
        for (const [key, cssVar] of Object.entries(cntMap)) {
            const value =
                theme.containers[key as keyof typeof theme.containers];
            if (value) vars.push(`--${cssVar}: ${value};`);
        }
    }

    // Derived section variant tokens
    const fg = theme.tokens?.foreground ?? '';
    const bg = theme.tokens?.background ?? '';
    if (fg) vars.push(`--section-dark-bg: ${fg};`);
    if (bg) vars.push(`--section-dark-text: ${bg};`);

    return vars.join(' ');
}

export function ThemeStyles({ theme }: { theme: ActiveTheme | null }) {
    if (!theme) return null;

    const cssVars = buildCssVariables(theme);
    if (!cssVars) return null;

    return (
        <style
            dangerouslySetInnerHTML={{
                __html: `:root { ${cssVars} }`,
            }}
        />
    );
}
