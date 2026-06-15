import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { FeaturedProductsBlock } from '@/components/page-builder/blocks/featured-products';
import type { PageBlock, Product } from '@/types/api';

vi.mock('@/components/product-card', () => ({
    ProductCard: ({ product }: { product: { name: string } }) => (
        <article>{product.name}</article>
    ),
}));

vi.mock('@/lib/api', () => ({
    apiGetPage: vi.fn(() => Promise.resolve({ data: [] })),
}));

const { apiGetPage } = await import('@/lib/api');

function makeProduct(id: number, name: string): Product {
    return {
        attributes: [],
        brand: null,
        category: {
            id: 1,
            image_url: null,
            name: 'Category',
            public_url: '/categories/category',
            slug: 'category',
        },
        compare_at_price_min: null,
        created_at: '2026-01-01T00:00:00.000Z',
        discount_percentage: null,
        id,
        images: [],
        is_active: true,
        is_on_sale: false,
        name,
        omnibus_price_min: null,
        price_max: 1000,
        price_min: 1000,
        public_url: `/products/${id}`,
        short_description: null,
        slug: `product-${id}`,
        thumbnail: null,
        variants: [],
    };
}

function makeBlock(
    configuration: Record<string, unknown>,
    products: Product[],
): PageBlock {
    return {
        configuration,
        id: 1,
        is_active: true,
        position: 0,
        relations: products.map((product, index) => ({
            data: product,
            id: index + 1,
            metadata: null,
            position: index,
            relation_id: product.id,
            relation_key: 'products',
            relation_type: 'product',
        })),
        reusable_block_id: null,
        type: 'featured_products',
    };
}

describe('FeaturedProductsBlock', () => {
    it('renders products from server-provided relations during SSR', () => {
        const html = renderToStaticMarkup(
            <FeaturedProductsBlock
                block={makeBlock(
                    { filter_mode: 'featured', title: 'Featured' },
                    [
                        makeProduct(1, 'Server Product A'),
                        makeProduct(2, 'Server Product B'),
                    ],
                )}
            />,
        );

        expect(html).toContain('Server Product A');
        expect(html).toContain('Server Product B');
        expect(html).toContain('Featured');
    });

    it('does not fetch products on the client at runtime', () => {
        vi.mocked(apiGetPage).mockClear();

        renderToStaticMarkup(
            <FeaturedProductsBlock
                block={makeBlock({ filter_mode: 'featured', max_items: 8 }, [
                    makeProduct(1, 'Already Resolved'),
                ])}
            />,
        );

        expect(apiGetPage).not.toHaveBeenCalled();
    });

    it('renders skeleton placeholders when no products are available', () => {
        const html = renderToStaticMarkup(
            <FeaturedProductsBlock
                block={makeBlock(
                    { filter_mode: 'featured', items_per_row: 4 },
                    [],
                )}
            />,
        );

        expect(html).toContain('skeleton-shimmer');
        expect(html).not.toContain('No products to display.');
    });
});
