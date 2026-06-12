import type { Metafield } from '@/types/api';
import { sanitizeHtml } from './sanitize';

type RenderableMetafield = {
    namespace: string;
    key: string;
    label: string;
    value: string;
    html?: string;
};

const SAFE_RENDER_KEYS: Record<string, Set<string>> = {
    product: new Set(['marketing::badge', 'marketing::highlights']),
    blog_post: new Set(['content::callout', 'content::note']),
};

export function getRenderableMetafields(
    ownerType: keyof typeof SAFE_RENDER_KEYS,
    metafields: Metafield[] | undefined,
): RenderableMetafield[] {
    if (!metafields || metafields.length === 0) {
        return [];
    }

    const allowed = SAFE_RENDER_KEYS[ownerType];

    return metafields
        .filter((metafield) =>
            allowed.has(`${metafield.namespace}::${metafield.key}`),
        )
        .map((metafield) => {
            const label = `${metafield.namespace}.${metafield.key}`;
            const value = formatMetafieldValue(metafield);

            return {
                namespace: metafield.namespace,
                key: metafield.key,
                label,
                value,
                html:
                    metafield.type === 'rich_text'
                        ? sanitizeHtml(value)
                        : undefined,
            };
        });
}

function formatMetafieldValue(metafield: Metafield): string {
    if (
        metafield.casted_value === null ||
        metafield.casted_value === undefined
    ) {
        return '';
    }

    if (typeof metafield.casted_value === 'string') {
        return metafield.casted_value;
    }

    if (
        typeof metafield.casted_value === 'number' ||
        typeof metafield.casted_value === 'boolean'
    ) {
        return String(metafield.casted_value);
    }

    return JSON.stringify(metafield.casted_value, null, 2);
}
