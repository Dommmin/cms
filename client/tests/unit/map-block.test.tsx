import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { MapBlock } from '@/components/page-builder/blocks/map-block';
import type { PageBlock, Store } from '@/types/api';

vi.mock('@/components/store-map', () => ({
    StoreMap: ({ stores }: { stores: { name: string }[] }) => (
        <div data-testid="store-map">{stores.map((s) => s.name).join(',')}</div>
    ),
}));

function makeStore(name: string): Store {
    return {
        address: 'Main St 1',
        city: 'Warsaw',
        country: 'PL',
        email: null,
        id: 1,
        lat: 52.23,
        lng: 21.01,
        name,
        opening_hours: null,
        phone: null,
        slug: 'downtown',
    };
}

function makeBlock(
    configuration: Record<string, unknown>,
    stores: Store[] = [],
): PageBlock {
    return {
        configuration,
        id: 1,
        is_active: true,
        position: 0,
        relations: stores.map((store, index) => ({
            data: store,
            id: index + 1,
            metadata: null,
            position: index,
            relation_id: store.id,
            relation_key: 'location',
            relation_type: 'store',
        })),
        reusable_block_id: null,
        type: 'map',
    };
}

describe('MapBlock', () => {
    it('renders store from server-provided relations without fetching', () => {
        const fetchSpy = vi.spyOn(globalThis, 'fetch');

        const html = renderToStaticMarkup(
            <MapBlock
                block={makeBlock({ store_id: 1, title: 'Our store' }, [
                    makeStore('Server Store'),
                ])}
            />,
        );

        expect(html).toContain('Server Store');
        expect(html).toContain('Our store');
        expect(fetchSpy).not.toHaveBeenCalled();

        fetchSpy.mockRestore();
    });

    it('falls back to coordinates from configuration when relations are empty', () => {
        const html = renderToStaticMarkup(
            <MapBlock
                block={makeBlock({
                    lat: 50.06,
                    lng: 19.94,
                    title: 'Krakow Office',
                })}
            />,
        );

        expect(html).toContain('Krakow Office');
        expect(html).toContain('store-map');
    });

    it('renders empty state when no store or coordinates are configured', () => {
        const html = renderToStaticMarkup(
            <MapBlock block={makeBlock({ title: 'Map' })} />,
        );

        expect(html).toContain('No location configured.');
    });
});
