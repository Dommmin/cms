'use client';

import { useMemo } from 'react';

import type { EditProps } from './edit.types';

export function ThemeLivePreview({ theme }: { theme: EditProps['theme'] }) {
    const previewStyle = useMemo(() => {
        const tokens = theme.tokens ?? {};

        return Object.fromEntries(
            Object.entries(tokens).map(([key, value]) => [`--${key}`, value]),
        ) as React.CSSProperties;
    }, [theme.tokens]);

    return (
        <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-semibold">Live preview</h3>
            <div
                className="space-y-4 rounded-lg border bg-background p-6 text-foreground"
                style={previewStyle}
            >
                <p className="text-xs text-muted-foreground">
                    Saved tokens — edit fields above and save to publish
                    changes.
                </p>
                <h4
                    className="text-xl font-bold text-foreground"
                    style={{ fontFamily: 'var(--font-heading, inherit)' }}
                >
                    Sample heading
                </h4>
                <p className="text-sm text-muted-foreground">
                    Body text on background using current theme tokens.
                </p>
                <div className="flex gap-2">
                    <span className="rounded-[var(--btn-radius,0.375rem)] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                        Primary
                    </span>
                    <span className="rounded-[var(--btn-radius,0.375rem)] bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
                        Secondary
                    </span>
                </div>
            </div>
        </div>
    );
}
