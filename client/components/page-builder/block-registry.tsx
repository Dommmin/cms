import dynamic from 'next/dynamic';

import type { BlockRegistry } from './block-registry.types';

const HeroBannerBlock = dynamic(() =>
    import('./blocks/hero-banner').then((m) => ({
        default: m.HeroBannerBlock,
    })),
);
const RichTextBlock = dynamic(() =>
    import('./blocks/rich-text').then((m) => ({ default: m.RichTextBlock })),
);
const FeaturedProductsBlock = dynamic(() =>
    import('./blocks/featured-products').then((m) => ({
        default: m.FeaturedProductsBlock,
    })),
);
const CategoriesGridBlock = dynamic(() =>
    import('./blocks/categories-grid').then((m) => ({
        default: m.CategoriesGridBlock,
    })),
);
const PromotionalBannerBlock = dynamic(() =>
    import('./blocks/promotional-banner').then((m) => ({
        default: m.PromotionalBannerBlock,
    })),
);
const NewsletterSignupBlock = dynamic(() =>
    import('./blocks/newsletter-signup').then((m) => ({
        default: m.NewsletterSignupBlock,
    })),
);
const TestimonialsBlock = dynamic(() =>
    import('./blocks/testimonials').then((m) => ({
        default: m.TestimonialsBlock,
    })),
);
const ImageGalleryBlock = dynamic(() =>
    import('./blocks/image-gallery').then((m) => ({
        default: m.ImageGalleryBlock,
    })),
);
const VideoEmbedBlock = dynamic(() =>
    import('./blocks/video-embed').then((m) => ({
        default: m.VideoEmbedBlock,
    })),
);
const CustomHtmlBlock = dynamic(() =>
    import('./blocks/custom-html').then((m) => ({
        default: m.CustomHtmlBlock,
    })),
);
const TwoColumnsBlock = dynamic(() =>
    import('./blocks/two-columns').then((m) => ({
        default: m.TwoColumnsBlock,
    })),
);
const ThreeColumnsBlock = dynamic(() =>
    import('./blocks/three-columns').then((m) => ({
        default: m.ThreeColumnsBlock,
    })),
);
const AccordionBlock = dynamic(() =>
    import('./blocks/accordion-block').then((m) => ({
        default: m.AccordionBlock,
    })),
);
const TabsBlock = dynamic(() =>
    import('./blocks/tabs-block').then((m) => ({ default: m.TabsBlock })),
);
const FormEmbedBlock = dynamic(() =>
    import('./blocks/form-embed').then((m) => ({ default: m.FormEmbedBlock })),
);
const MapBlock = dynamic(() =>
    import('./blocks/map-block').then((m) => ({ default: m.MapBlock })),
);
const FeaturedPostsBlock = dynamic(() =>
    import('./blocks/featured-posts').then((m) => ({
        default: m.FeaturedPostsBlock,
    })),
);
const StatsCounterBlock = dynamic(() =>
    import('./blocks/stats-counter').then((m) => ({
        default: m.StatsCounterBlock,
    })),
);
const CallToActionBlock = dynamic(() =>
    import('./blocks/call-to-action').then((m) => ({
        default: m.CallToActionBlock,
    })),
);
const PricingTableBlock = dynamic(() =>
    import('./blocks/pricing-table').then((m) => ({
        default: m.PricingTableBlock,
    })),
);
const BrandsSliderBlock = dynamic(() =>
    import('./blocks/brands-slider').then((m) => ({
        default: m.BrandsSliderBlock,
    })),
);
const LogoCloudBlock = dynamic(() =>
    import('./blocks/logo-cloud').then((m) => ({ default: m.LogoCloudBlock })),
);
const CountdownTimerBlock = dynamic(() =>
    import('./blocks/countdown-timer').then((m) => ({
        default: m.CountdownTimerBlock,
    })),
);
const TimelineBlock = dynamic(() =>
    import('./blocks/timeline').then((m) => ({ default: m.TimelineBlock })),
);
const TeamMembersBlock = dynamic(() =>
    import('./blocks/team-members').then((m) => ({
        default: m.TeamMembersBlock,
    })),
);
const IconListBlock = dynamic(() =>
    import('./blocks/icon-list').then((m) => ({ default: m.IconListBlock })),
);
const StepsProcessBlock = dynamic(() =>
    import('./blocks/steps-process').then((m) => ({
        default: m.StepsProcessBlock,
    })),
);
const TrustBadgesBlock = dynamic(() =>
    import('./blocks/trust-badges').then((m) => ({
        default: m.TrustBadgesBlock,
    })),
);
const AlertBannerBlock = dynamic(() =>
    import('./blocks/alert-banner').then((m) => ({
        default: m.AlertBannerBlock,
    })),
);
const PricingCardsBlock = dynamic(() =>
    import('./blocks/pricing-cards').then((m) => ({
        default: m.PricingCardsBlock,
    })),
);

export const blockRegistry = {
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
} satisfies BlockRegistry;
