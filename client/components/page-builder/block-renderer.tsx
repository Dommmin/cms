import { AccordionBlock } from "./blocks/accordion-block";
import { BrandsSliderBlock } from "./blocks/brands-slider";
import { IconListBlock } from "./blocks/icon-list";
import { StepsProcessBlock } from "./blocks/steps-process";
import { TrustBadgesBlock } from "./blocks/trust-badges";
import { CallToActionBlock } from "./blocks/call-to-action";
import { CategoriesGridBlock } from "./blocks/categories-grid";
import { CountdownTimerBlock } from "./blocks/countdown-timer";
import { CustomHtmlBlock } from "./blocks/custom-html";
import { FeaturedPostsBlock } from "./blocks/featured-posts";
import { FeaturedProductsBlock } from "./blocks/featured-products";
import { FormEmbedBlock } from "./blocks/form-embed";
import { HeroBannerBlock } from "./blocks/hero-banner";
import { ImageGalleryBlock } from "./blocks/image-gallery";
import { LogoCloudBlock } from "./blocks/logo-cloud";
import { MapBlock } from "./blocks/map-block";
import { NewsletterSignupBlock } from "./blocks/newsletter-signup";
import { PricingTableBlock } from "./blocks/pricing-table";
import { PromotionalBannerBlock } from "./blocks/promotional-banner";
import { RichTextBlock } from "./blocks/rich-text";
import { StatsCounterBlock } from "./blocks/stats-counter";
import { TabsBlock } from "./blocks/tabs-block";
import { TeamMembersBlock } from "./blocks/team-members";
import { TestimonialsBlock } from "./blocks/testimonials";
import { ThreeColumnsBlock } from "./blocks/three-columns";
import { TimelineBlock } from "./blocks/timeline";
import { TwoColumnsBlock } from "./blocks/two-columns";
import { VideoEmbedBlock } from "./blocks/video-embed";
import type { BlockRendererProps } from './block-renderer.types';

export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case "hero_banner":
      return <HeroBannerBlock block={block} />;
    case "rich_text":
      return <RichTextBlock block={block} />;
    case "featured_products":
      return <FeaturedProductsBlock block={block} />;
    case "categories_grid":
      return <CategoriesGridBlock block={block} />;
    case "promotional_banner":
      return <PromotionalBannerBlock block={block} />;
    case "newsletter_signup":
      return <NewsletterSignupBlock block={block} />;
    case "testimonials":
      return <TestimonialsBlock block={block} />;
    case "image_gallery":
      return <ImageGalleryBlock block={block} />;
    case "video_embed":
      return <VideoEmbedBlock block={block} />;
    case "custom_html":
      return <CustomHtmlBlock block={block} />;
    case "two_columns":
      return <TwoColumnsBlock block={block} />;
    case "three_columns":
      return <ThreeColumnsBlock block={block} />;
    case "accordion":
      return <AccordionBlock block={block} />;
    case "tabs":
      return <TabsBlock block={block} />;
    case "form_embed":
      return <FormEmbedBlock block={block} />;
    case "map":
      return <MapBlock block={block} />;
    case "featured_posts":
      return <FeaturedPostsBlock block={block} />;
    case "stats_counter":
      return <StatsCounterBlock block={block} />;
    case "call_to_action":
      return <CallToActionBlock block={block} />;
    case "pricing_table":
      return <PricingTableBlock block={block} />;
    case "brands_slider":
      return <BrandsSliderBlock block={block} />;
    case "logo_cloud":
      return <LogoCloudBlock block={block} />;
    case "countdown_timer":
      return <CountdownTimerBlock block={block} />;
    case "timeline":
      return <TimelineBlock block={block} />;
    case "team_members":
      return <TeamMembersBlock block={block} />;
    case "icon_list":
      return <IconListBlock block={block} />;
    case "steps_process":
      return <StepsProcessBlock block={block} />;
    case "trust_badges":
      return <TrustBadgesBlock block={block} />;
    default:
      // Unknown block type — silent fallback in production
      if (process.env.NODE_ENV === "development") {
        return (
          <div className="rounded-lg border border-dashed border-amber-400 bg-amber-50 p-4 text-sm text-amber-700">
            Unknown block type: <strong>{block.type}</strong>
          </div>
        );
      }
      return null;
  }
}
