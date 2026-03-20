import { AccordionBlock } from "./blocks/accordion-block";
import { MapBlock } from "./blocks/map-block";
import { CategoriesGridBlock } from "./blocks/categories-grid";
import { CustomHtmlBlock } from "./blocks/custom-html";
import { FeaturedPostsBlock } from "./blocks/featured-posts";
import { FeaturedProductsBlock } from "./blocks/featured-products";
import { FormEmbedBlock } from "./blocks/form-embed";
import { HeroBannerBlock } from "./blocks/hero-banner";
import { ImageGalleryBlock } from "./blocks/image-gallery";
import { NewsletterSignupBlock } from "./blocks/newsletter-signup";
import { PromotionalBannerBlock } from "./blocks/promotional-banner";
import { RichTextBlock } from "./blocks/rich-text";
import { TabsBlock } from "./blocks/tabs-block";
import { TestimonialsBlock } from "./blocks/testimonials";
import { ThreeColumnsBlock } from "./blocks/three-columns";
import { TwoColumnsBlock } from "./blocks/two-columns";
import { VideoEmbedBlock } from "./blocks/video-embed";
import type { PageBlock } from "@/types/api";

interface Props {
  block: PageBlock;
}

export function BlockRenderer({ block }: Props) {
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
