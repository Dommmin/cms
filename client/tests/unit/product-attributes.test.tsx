import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ProductTabs } from '@/app/products/[slug]/product-detail-components';
import {
    getListingAttributeEntries,
    getProductSpecificationEntries,
} from '@/lib/product-attributes';
import type { Product } from '@/types/api';

function makeProduct(overrides: Partial<Product> = {}): Product {
    return {
        id: 1,
        name: 'Trail Backpack',
        slug: 'trail-backpack',
        public_url: '/products/trail-backpack',
        short_description: 'Short description',
        description: '<p>Field-tested in alpine conditions.</p>',
        price_min: 12900,
        price_max: 12900,
        is_active: true,
        is_featured: false,
        is_on_sale: false,
        discount_percentage: null,
        compare_at_price_min: null,
        omnibus_price_min: null,
        thumbnail: null,
        images: [],
        variants: [
            {
                id: 11,
                sku: 'TBP-RED',
                price: 12900,
                compare_at_price: null,
                omnibus_price: null,
                stock_quantity: 5,
                is_available: true,
                attributes: { Color: 'Red' },
            },
        ],
        category: null,
        brand: null,
        attributes: [],
        attribute_values: [],
        attribute_summary: {},
        attribute_map: {},
        active_promotions: [],
        created_at: '2026-06-12T00:00:00Z',
        seo_title: null,
        seo_description: null,
        meta_description: null,
        meta_robots: 'index, follow',
        og_image: null,
        sitemap_exclude: false,
        ...overrides,
    };
}

describe('product attribute storefront helpers', () => {
    it('builds specification entries from attribute_values without empty values or variant-option duplicates', () => {
        const product = makeProduct({
            attribute_values: [
                {
                    attribute_id: 1,
                    slug: 'material',
                    label: 'Material',
                    type: 'text',
                    unit: null,
                    is_required: true,
                    value: 'Ripstop nylon',
                    display_value: 'Ripstop nylon',
                },
                {
                    attribute_id: 2,
                    slug: 'waterproof',
                    label: 'Waterproof',
                    type: 'boolean',
                    unit: null,
                    is_required: false,
                    value: false,
                    display_value: false,
                },
                {
                    attribute_id: 3,
                    slug: 'warranty',
                    label: 'Warranty',
                    type: 'text',
                    unit: null,
                    is_required: false,
                    value: null,
                    display_value: null,
                },
                {
                    attribute_id: 4,
                    slug: 'color',
                    label: 'Color',
                    type: 'select',
                    unit: null,
                    is_required: false,
                    value: 'red',
                    display_value: 'Red',
                },
            ],
            variant_options: [
                { slug: 'color', label: 'Color', values: ['Red'] },
            ],
        });

        expect(
            getProductSpecificationEntries(product, {
                trueLabel: 'Yes',
                falseLabel: 'No',
            }),
        ).toEqual([
            {
                slug: 'material',
                label: 'Material',
                values: ['Ripstop nylon'],
            },
            {
                slug: 'waterproof',
                label: 'Waterproof',
                values: ['No'],
            },
        ]);
    });

    it('prefers attribute_summary over legacy attribute_map on listings', () => {
        const product = makeProduct({
            attribute_summary: {
                material: { label: 'Material', value: 'Merino wool' },
                breathable: { label: 'Breathable', value: 'true' },
            },
            attribute_map: {
                Color: ['Red'],
            },
        });

        expect(
            getListingAttributeEntries(product, {
                trueLabel: 'Yes',
                falseLabel: 'No',
            }),
        ).toEqual([
            { label: 'Material', values: ['Merino wool'] },
            { label: 'Breathable', values: ['Yes'] },
        ]);
    });

    it('renders the specifications section from attribute_values on product detail', () => {
        const product = makeProduct({
            attribute_values: [
                {
                    attribute_id: 1,
                    slug: 'material',
                    label: 'Material',
                    type: 'text',
                    unit: null,
                    is_required: true,
                    value: 'Ripstop nylon',
                    display_value: 'Ripstop nylon',
                },
                {
                    attribute_id: 2,
                    slug: 'waterproof',
                    label: 'Waterproof',
                    type: 'boolean',
                    unit: null,
                    is_required: false,
                    value: false,
                    display_value: false,
                },
                {
                    attribute_id: 3,
                    slug: 'warranty',
                    label: 'Warranty',
                    type: 'text',
                    unit: null,
                    is_required: false,
                    value: null,
                    display_value: null,
                },
            ],
        });

        const markup = renderToStaticMarkup(
            <ProductTabs
                activeTab="description"
                product={product}
                reviews={[]}
                totalReviews={0}
                userExists={false}
                reviewSubmitted={false}
                rating={0}
                reviewTitle=""
                reviewBody=""
                isSubmitting={false}
                loginHref="/login"
                onTabChange={() => {}}
                onReviewSubmit={() => {}}
                onRatingChange={() => {}}
                onReviewTitleChange={() => {}}
                onReviewBodyChange={() => {}}
                onMarkHelpful={() => {}}
                labels={{
                    tabs: 'Product information',
                    specifications: 'Specifications',
                    description: 'Description',
                    reviews: 'Reviews',
                    yes: 'Yes',
                    no: 'No',
                    noReviews: 'No reviews',
                    verified: 'Verified',
                    helpful: 'Helpful',
                    markHelpful: 'Mark helpful',
                    writeReview: 'Write a review',
                    rating: 'Rating',
                    optional: 'optional',
                    title: 'Title',
                    review: 'Review',
                    titlePlaceholder: 'Title',
                    bodyPlaceholder: 'Body',
                    submitting: 'Submitting',
                    submit: 'Submit',
                    thankYou: 'Thanks',
                    login: 'Login',
                    loginSuffix: 'to review',
                }}
            />,
        );

        expect(markup).toContain('Specifications');
        expect(markup).toContain('Material');
        expect(markup).toContain('Ripstop nylon');
        expect(markup).toContain('Waterproof');
        expect(markup).toContain('No');
        expect(markup).not.toContain('Warranty');
    });
});
