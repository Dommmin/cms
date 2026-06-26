import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { BrandsSliderBlock } from '@/components/page-builder/blocks/brands-slider';
import type { Brand, PageBlock } from '@/types/api';

vi.mock('next/image', () => ({
    default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

function makeBrand(id: number, name: string): Brand {
    return {
        id,
        logo_url: null,
        name,
        public_url: `/brands/${id}`,
        slug: `brand-${id}`,
    };
}

function makeBlock(brands: Brand[]): PageBlock {
    return {
        configuration: { source: 'all', title: 'Brands' },
        id: 1,
        is_active: true,
        position: 0,
        relations: brands.map((brand, index) => ({
            data: brand as unknown as Record<string, unknown>,
            id: index + 1,
            metadata: null,
            position: index,
            relation_id: brand.id,
            relation_key: 'brands',
            relation_type: 'brand',
        })),
        reusable_block_id: null,
        type: 'brands_slider',
    };
}

describe('BrandsSliderBlock', () => {
    it('renders brands from server-provided relations', () => {
        const html = renderToStaticMarkup(
            <BrandsSliderBlock
                block={makeBlock([makeBrand(1, 'Alpha'), makeBrand(2, 'Beta')])}
            />,
        );

        expect(html).toContain('Alpha');
        expect(html).toContain('Beta');
        expect(html).toContain('Brands');
    });
});
