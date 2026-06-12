import { describe, expect, it } from 'vitest';

import { getRenderableMetafields } from '@/lib/metafields';
import type { Metafield } from '@/types/api';

function makeMetafield(overrides: Partial<Metafield>): Metafield {
    return {
        id: 1,
        namespace: 'marketing',
        key: 'badge',
        type: 'string',
        value: 'Featured',
        description: null,
        casted_value: 'Featured',
        ...overrides,
    };
}

describe('storefront metafields', () => {
    it('renders only explicitly allowed public metafields', () => {
        const metafields = [
            makeMetafield({
                id: 1,
                namespace: 'marketing',
                key: 'badge',
                casted_value: 'Featured',
            }),
            makeMetafield({
                id: 2,
                namespace: 'internal',
                key: 'secret_note',
                casted_value: 'Do not show',
            }),
        ];

        expect(getRenderableMetafields('product', metafields)).toEqual([
            {
                namespace: 'marketing',
                key: 'badge',
                label: 'marketing.badge',
                value: 'Featured',
                html: undefined,
            },
        ]);
    });

    it('skips non-allowlisted blog metafields', () => {
        const metafields = [
            makeMetafield({
                id: 3,
                namespace: 'content',
                key: 'note',
                casted_value: 'Shown on blog',
            }),
            makeMetafield({
                id: 4,
                namespace: 'admin',
                key: 'only',
                casted_value: 'Hidden',
            }),
        ];

        expect(getRenderableMetafields('blog_post', metafields)).toEqual([
            {
                namespace: 'content',
                key: 'note',
                label: 'content.note',
                value: 'Shown on blog',
                html: undefined,
            },
        ]);
    });
});
