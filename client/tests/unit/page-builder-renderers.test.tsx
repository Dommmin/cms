import type { AnchorHTMLAttributes, ComponentType, ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import type { ActiveTheme } from '@/app/layout.types';
import type { BlockRendererProps } from '@/components/page-builder/block-renderer.types';
import { AccordionBlock } from '@/components/page-builder/blocks/accordion-block';
import { AlertBannerBlock } from '@/components/page-builder/blocks/alert-banner';
import { BrandsSliderBlock } from '@/components/page-builder/blocks/brands-slider';
import { CallToActionBlock } from '@/components/page-builder/blocks/call-to-action';
import { CategoriesGridBlock } from '@/components/page-builder/blocks/categories-grid';
import { CountdownTimerBlock } from '@/components/page-builder/blocks/countdown-timer';
import { CustomHtmlBlock } from '@/components/page-builder/blocks/custom-html';
import { FeaturedPostsBlock } from '@/components/page-builder/blocks/featured-posts';
import { FeaturedProductsBlock } from '@/components/page-builder/blocks/featured-products';
import { FormEmbedBlock } from '@/components/page-builder/blocks/form-embed';
import { HeroBannerBlock } from '@/components/page-builder/blocks/hero-banner';
import { IconListBlock } from '@/components/page-builder/blocks/icon-list';
import { ImageGalleryBlock } from '@/components/page-builder/blocks/image-gallery';
import { LogoCloudBlock } from '@/components/page-builder/blocks/logo-cloud';
import { MapBlock } from '@/components/page-builder/blocks/map-block';
import { NewsletterSignupBlock } from '@/components/page-builder/blocks/newsletter-signup';
import { PricingCardsBlock } from '@/components/page-builder/blocks/pricing-cards';
import { PricingTableBlock } from '@/components/page-builder/blocks/pricing-table';
import { PromotionalBannerBlock } from '@/components/page-builder/blocks/promotional-banner';
import { RichTextBlock } from '@/components/page-builder/blocks/rich-text';
import { StatsCounterBlock } from '@/components/page-builder/blocks/stats-counter';
import { StepsProcessBlock } from '@/components/page-builder/blocks/steps-process';
import { TabsBlock } from '@/components/page-builder/blocks/tabs-block';
import { TeamMembersBlock } from '@/components/page-builder/blocks/team-members';
import { TestimonialsBlock } from '@/components/page-builder/blocks/testimonials';
import { ThreeColumnsBlock } from '@/components/page-builder/blocks/three-columns';
import { TimelineBlock } from '@/components/page-builder/blocks/timeline';
import { TrustBadgesBlock } from '@/components/page-builder/blocks/trust-badges';
import { TwoColumnsBlock } from '@/components/page-builder/blocks/two-columns';
import { VideoEmbedBlock } from '@/components/page-builder/blocks/video-embed';
import {
    SectionLazyWrapper,
    SectionRenderer,
} from '@/components/page-builder/section-renderer';
import { ThemeStyles } from '@/components/theme-styles';
import type {
    BlockRelation,
    BlockType,
    PageBlock,
    PageSection,
} from '@/types/api';

vi.mock('next/link', () => ({
    default: ({
        children,
        href,
        ...props
    }: AnchorHTMLAttributes<HTMLAnchorElement> & {
        children: ReactNode;
        href: string;
    }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

vi.mock('next/image', () => ({
    default: ({
        src,
        alt,
    }: {
        alt: string;
        src: string | { src?: string };
    }) => (
        <span
            aria-label={alt}
            data-image-src={typeof src === 'string' ? src : (src.src ?? '')}
            role="img"
        />
    ),
}));

vi.mock('next/dynamic', () => ({
    default: (
        _loader: unknown,
        options?: { loading?: ComponentType<Record<string, never>> },
    ) => {
        const Loading = options?.loading;

        return function DynamicMock() {
            return Loading ? <Loading /> : null;
        };
    },
}));

vi.mock('framer-motion', () => ({
    useInView: vi.fn(() => false),
}));

vi.mock('js-cookie', () => ({
    default: {
        get: vi.fn(() => undefined),
        set: vi.fn(),
    },
}));

vi.mock('react-toastify', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

vi.mock('@/api/forms', () => ({
    submitForm: vi.fn(),
}));

vi.mock('@/api/newsletter', () => ({
    subscribe: vi.fn(),
}));

vi.mock('@/components/product-card', () => ({
    ProductCard: ({ product }: { product: { name: string } }) => (
        <article>{product.name}</article>
    ),
}));

vi.mock('@/components/turnstile-widget', () => ({
    TurnstileWidget: () => null,
}));

vi.mock('@/lib/api', () => ({
    apiGetPage: vi.fn(() => Promise.resolve({ data: [] })),
}));

const blockComponents: Record<BlockType, ComponentType<BlockRendererProps>> = {
    hero_banner: HeroBannerBlock,
    rich_text: RichTextBlock,
    featured_products: FeaturedProductsBlock,
    categories_grid: CategoriesGridBlock,
    promotional_banner: PromotionalBannerBlock,
    newsletter_signup: NewsletterSignupBlock,
    testimonials: TestimonialsBlock,
    image_gallery: ImageGalleryBlock,
    video_embed: VideoEmbedBlock,
    custom_html: CustomHtmlBlock,
    two_columns: TwoColumnsBlock,
    three_columns: ThreeColumnsBlock,
    accordion: AccordionBlock,
    tabs: TabsBlock,
    form_embed: FormEmbedBlock,
    map: MapBlock,
    featured_posts: FeaturedPostsBlock,
    stats_counter: StatsCounterBlock,
    call_to_action: CallToActionBlock,
    pricing_table: PricingTableBlock,
    brands_slider: BrandsSliderBlock,
    logo_cloud: LogoCloudBlock,
    countdown_timer: CountdownTimerBlock,
    timeline: TimelineBlock,
    team_members: TeamMembersBlock,
    icon_list: IconListBlock,
    steps_process: StepsProcessBlock,
    trust_badges: TrustBadgesBlock,
    alert_banner: AlertBannerBlock,
    pricing_cards: PricingCardsBlock,
};

const blockFixtures: Record<BlockType, Record<string, unknown>> = {
    hero_banner: {
        title: 'Hero headline',
        subtitle: 'Hero subtitle',
        cta_label: 'Open',
        cta_url: '/products',
    },
    rich_text: {
        content: '<p>Rich text body</p>',
    },
    featured_products: {
        filter_mode: 'manual',
        title: 'Featured products',
    },
    categories_grid: {
        title: 'Categories',
    },
    promotional_banner: {
        title: 'Promotion',
        subtitle: 'Short copy',
        cta_label: 'Shop',
        cta_url: '/promo',
    },
    newsletter_signup: {
        button_text: 'Subscribe',
        title: 'Newsletter',
    },
    testimonials: {
        items: [{ author: 'Ada', quote: 'Great service', role: 'Editor' }],
    },
    image_gallery: {
        images: [{ alt: 'Gallery item', url: '/gallery.jpg' }],
    },
    video_embed: {
        title: 'Video',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    },
    custom_html: {
        html: '<p>Custom markup</p>',
    },
    two_columns: {
        left_content: '<p>Left column</p>',
        right_content: '<p>Right column</p>',
    },
    three_columns: {
        column_1_content: '<p>One</p>',
        column_2_content: '<p>Two</p>',
        column_3_content: '<p>Three</p>',
    },
    accordion: {
        items: [{ content: '<p>Answer</p>', title: 'Question' }],
    },
    tabs: {
        tabs: [{ content: '<p>Tab body</p>', title: 'Tab one' }],
    },
    form_embed: {
        form: null,
        title: 'Contact',
    },
    map: {
        height: 320,
        title: 'Location',
    },
    featured_posts: {
        title: 'Posts',
    },
    stats_counter: {
        animate_numbers: false,
        stats: [{ label: 'Orders', value: '12' }],
    },
    call_to_action: {
        button_label: 'Act',
        button_url: '/act',
        title: 'Call to action',
    },
    pricing_table: {
        plans: [
            {
                cta_label: 'Buy',
                cta_url: '/buy',
                features: 'Feature',
                name: 'Basic',
                price: '$10',
            },
        ],
    },
    brands_slider: {
        title: 'Brands',
    },
    logo_cloud: {
        title: 'Logos',
    },
    countdown_timer: {
        target_date: '2099-01-01T00:00:00.000Z',
        title: 'Countdown',
    },
    timeline: {
        items: [{ date: '2026', description: 'Started', title: 'Start' }],
    },
    team_members: {
        members: [{ name: 'Ada Lovelace', role: 'Lead' }],
    },
    icon_list: {
        items: [{ icon: 'check', text: 'Fast setup', title: 'Fast' }],
    },
    steps_process: {
        steps: [{ description: 'Create content', title: 'Draft' }],
    },
    trust_badges: {
        badges: [{ icon: 'shield', label: 'Secure' }],
    },
    alert_banner: {
        message: 'Important message',
        variant: 'info',
    },
    pricing_cards: {
        plans: [{ features: ['Feature'], name: 'Starter', price: '$10' }],
        title: 'Pricing',
    },
};

const blockRelations: Partial<Record<BlockType, BlockRelation[]>> = {
    brands_slider: [
        {
            data: { id: 1, logo_url: '/brand.png', name: 'Brand' },
            id: 1,
            metadata: null,
            position: 1,
            relation_id: 1,
            relation_key: 'brands',
            relation_type: 'brand',
        },
    ],
    logo_cloud: [
        {
            data: null,
            id: 1,
            metadata: { url: '/logo.png' },
            position: 1,
            relation_id: 1,
            relation_key: 'logos',
            relation_type: 'media',
        },
    ],
};

function makeBlock(type: BlockType): PageBlock {
    return {
        configuration: blockFixtures[type],
        id: Object.keys(blockComponents).indexOf(type) + 1,
        is_active: true,
        position: 1,
        relations: blockRelations[type] ?? [],
        reusable_block_id: null,
        type,
    };
}

function makeSection(overrides: Partial<PageSection> = {}): PageSection {
    return {
        blocks: [],
        id: 10,
        is_active: true,
        layout: 'contained',
        position: 1,
        section_type: 'content',
        settings: null,
        variant: 'light',
        ...overrides,
    };
}

describe('page builder block renderers', () => {
    it.each(Object.entries(blockComponents))(
        'renders %s block',
        (type, Block) => {
            const html = renderToStaticMarkup(
                <Block block={makeBlock(type as BlockType)} />,
            );

            expect(html.length).toBeGreaterThan(0);
        },
    );
});

describe('page builder section renderer', () => {
    it.each([
        ['light', 'bg-[var(--background)] text-[var(--foreground)]'],
        [
            'dark',
            'bg-[var(--section-dark-bg,var(--foreground))] text-[var(--section-dark-text,var(--background))]',
        ],
        ['brand', 'bg-[var(--primary)] text-[var(--primary-foreground)]'],
    ] as const)(
        'renders %s variant with theme variable classes',
        (variant, className) => {
            const html = renderToStaticMarkup(
                <SectionRenderer section={makeSection({ variant })} />,
            );

            expect(html).toContain(className);
        },
    );

    it.each([
        ['contained', 'max-w-[var(--container-max-width,80rem)]'],
        ['full-width', 'w-full'],
        ['two-col', 'md:grid-cols-2'],
    ] as const)('renders %s layout container classes', (layout, className) => {
        const html = renderToStaticMarkup(
            <SectionRenderer section={makeSection({ layout })} />,
        );

        expect(html).toContain(className);
    });

    it('renders active block wrappers with section metadata', () => {
        const html = renderToStaticMarkup(
            <SectionRenderer
                section={makeSection({
                    blocks: [
                        {
                            ...makeBlock('rich_text'),
                            configuration: {
                                ...blockFixtures.rich_text,
                                _custom_classes: 'custom-block',
                                _custom_id: 'intro-copy',
                            },
                        },
                    ],
                    layout: 'full-width',
                    variant: 'brand',
                })}
            />,
        );

        expect(html).toContain('data-section-id="10"');
        expect(html).toContain('id="intro-copy"');
        expect(html).toContain('custom-block');
    });

    it('renders a stable placeholder before a lazy section becomes visible', () => {
        const html = renderToStaticMarkup(
            <SectionLazyWrapper
                section={makeSection({
                    settings: {
                        lazy_load: '1',
                        min_height: '240px',
                    },
                })}
            />,
        );

        expect(html).toContain('data-section-id="10"');
        expect(html).toContain('min-height:240px');
    });
});

describe('theme styles', () => {
    it('renders active theme CSS variables consumed by page builder sections', () => {
        const theme: ActiveTheme = {
            slug: 'editorial',
            buttons: {
                primary_border_radius: '12px',
                primary_padding_x: '1.25rem',
                primary_padding_y: '0.75rem',
            },
            containers: {
                max_width: '72rem',
            },
            spacing: {
                section_padding: '6rem',
            },
            tokens: {
                background: '#ffffff',
                foreground: '#111111',
                primary: '#2563eb',
                'primary-foreground': '#ffffff',
            },
            typography: {
                heading_font: 'Inter',
            },
        };

        const html = renderToStaticMarkup(<ThemeStyles theme={theme} />);

        expect(html).toContain('--primary: #2563eb;');
        expect(html).toContain('--primary-foreground: #ffffff;');
        expect(html).toContain('--font-heading: Inter;');
        expect(html).toContain('--section-padding-y: 6rem;');
        expect(html).toContain('--btn-radius: 12px;');
        expect(html).toContain('--container-max-width: 72rem;');
        expect(html).toContain('--section-dark-bg: #111111;');
        expect(html).toContain('--section-dark-text: #ffffff;');
    });

    it('renders dark theme CSS variables for .dark selector', () => {
        const theme: ActiveTheme = {
            slug: 'editorial',
            tokens: {
                background: '#ffffff',
                foreground: '#111111',
            },
            dark_tokens: {
                background: '#0f172a',
                foreground: '#f8fafc',
                primary: '#818cf8',
            },
        };

        const html = renderToStaticMarkup(<ThemeStyles theme={theme} />);

        expect(html).toContain(':root {');
        expect(html).toContain('.dark {');
        expect(html).toContain('--background: #0f172a;');
        expect(html).toContain('--primary: #818cf8;');
    });

    it('skips unsupported or oversized CSS token keys', () => {
        const theme: ActiveTheme = {
            slug: 'restricted',
            tokens: {
                background: '#ffffff',
                malicious: 'url(javascript:alert(1))',
                primary: 'x'.repeat(101),
            },
        };

        const html = renderToStaticMarkup(<ThemeStyles theme={theme} />);

        expect(html).toContain('--background: #ffffff;');
        expect(html).not.toContain('malicious');
        expect(html).not.toContain('--primary:');
    });
});
