import type { BlockRelation, PageBlock } from "@/types/api";

export interface HeroBannerConfig {
  title?: string;
  subtitle?: string;
  cta_text?: string;
  cta_url?: string;
  cta_style?: "primary" | "secondary" | "outline" | "ghost";
  cta2_text?: string;
  cta2_url?: string;
  cta2_style?: "primary" | "secondary" | "outline" | "ghost";
  text_alignment?: "left" | "center" | "right";
  overlay_opacity?: number;
  min_height?: number;
}
export interface HeroBannerProps {
  block: PageBlock;
}
