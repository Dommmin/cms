import type { PageBlock } from "@/types/api";

export interface RichTextConfig {
  content?: string;
  text_size?: "sm" | "base" | "lg" | "xl";
}
export interface RichTextProps {
  block: PageBlock;
}
