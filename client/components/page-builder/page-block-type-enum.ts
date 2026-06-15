import type { BlockType } from '@/types/api';

/**
 * Mirror of server `App\Enums\PageBlockTypeEnum` — used for contract tests.
 */
export const PageBlockTypeEnum = {
    HeroBanner: 'hero_banner',
    RichText: 'rich_text',
    FeaturedProducts: 'featured_products',
    CategoriesGrid: 'categories_grid',
    PromotionalBanner: 'promotional_banner',
    NewsletterSignup: 'newsletter_signup',
    Testimonials: 'testimonials',
    ImageGallery: 'image_gallery',
    VideoEmbed: 'video_embed',
    CustomHtml: 'custom_html',
    TwoColumns: 'two_columns',
    ThreeColumns: 'three_columns',
    Accordion: 'accordion',
    Tabs: 'tabs',
    FormEmbed: 'form_embed',
    Map: 'map',
    FeaturedPosts: 'featured_posts',
    StatsCounter: 'stats_counter',
    CallToAction: 'call_to_action',
    PricingTable: 'pricing_table',
    BrandsSlider: 'brands_slider',
    LogoCloud: 'logo_cloud',
    CountdownTimer: 'countdown_timer',
    Timeline: 'timeline',
    TeamMembers: 'team_members',
    IconList: 'icon_list',
    StepsProcess: 'steps_process',
    TrustBadges: 'trust_badges',
    AlertBanner: 'alert_banner',
    PricingCards: 'pricing_cards',
} as const satisfies Record<string, BlockType>;

export type PageBlockTypeEnumValue =
    (typeof PageBlockTypeEnum)[keyof typeof PageBlockTypeEnum];
