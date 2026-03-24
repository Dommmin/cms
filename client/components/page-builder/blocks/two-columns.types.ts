import type { PageBlock } from "@/types/api";

export interface TwoColumnsConfig {
  left_title?: string;
  left_content?: string;
  right_title?: string;
  right_content?: string;
  /** text-image | image-text | text-text */
  layout?: string;
  ratio?: "50-50" | "60-40" | "40-60";
  vertical_align?: "top" | "center" | "bottom";
  gap?: "sm" | "md" | "lg";
}
export interface TwoColumnsProps {
  block: PageBlock;
}
