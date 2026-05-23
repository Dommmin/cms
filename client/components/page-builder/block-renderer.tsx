import dynamic from 'next/dynamic';

import type { BlockRendererProps } from './block-renderer.types';

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

export function BlockRenderer({ block }: BlockRendererProps) {
    switch (block.type) {
        case 'hero_banner':
            return <HeroBannerBlock block={block} />;
        case 'rich_text':
            return <RichTextBlock block={block} />;
        case 'featured_products':
            return <FeaturedProductsBlock block={block} />;
        case 'categories_grid':
            return <CategoriesGridBlock block={block} />;
        case 'promotional_banner':
            return <PromotionalBannerBlock block={block} />;
        case 'newsletter_signup':
            return <NewsletterSignupBlock block={block} />;
        case 'testimonials':
            return <TestimonialsBlock block={block} />;
        case 'image_gallery':
            return <ImageGalleryBlock block={block} />;
        case 'video_embed':
            return <VideoEmbedBlock block={block} />;
        case 'custom_html':
            return <CustomHtmlBlock block={block} />;
        case 'two_columns':
            return <TwoColumnsBlock block={block} />;
        case 'three_columns':
            return <ThreeColumnsBlock block={block} />;
        case 'accordion':
            return <AccordionBlock block={block} />;
        case 'tabs':
            return <TabsBlock block={block} />;
        case 'form_embed':
            return <FormEmbedBlock block={block} />;
        case 'map':
            return <MapBlock block={block} />;
        case 'featured_posts':
            return <FeaturedPostsBlock block={block} />;
        case 'stats_counter':
            return <StatsCounterBlock block={block} />;
        case 'call_to_action':
            return <CallToActionBlock block={block} />;
        case 'pricing_table':
            return <PricingTableBlock block={block} />;
        case 'brands_slider':
            return <BrandsSliderBlock block={block} />;
        case 'logo_cloud':
            return <LogoCloudBlock block={block} />;
        case 'countdown_timer':
            return <CountdownTimerBlock block={block} />;
        case 'timeline':
            return <TimelineBlock block={block} />;
        case 'team_members':
            return <TeamMembersBlock block={block} />;
        case 'icon_list':
            return <IconListBlock block={block} />;
        case 'steps_process':
            return <StepsProcessBlock block={block} />;
        case 'trust_badges':
            return <TrustBadgesBlock block={block} />;
        case 'alert_banner':
            return <AlertBannerBlock block={block} />;
        case 'pricing_cards':
            return <PricingCardsBlock block={block} />;
        default:
            if (process.env.NODE_ENV === 'development') {
                return (
                    <div className="rounded-lg border border-dashed border-amber-400 bg-amber-50 p-4 text-sm text-amber-700">
                        Unknown block type: <strong>{block.type}</strong>
                    </div>
                );
            }
            return null;
    }
}
