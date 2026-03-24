import type { PageBlock } from "@/types/api";

export interface AccordionItem {
  question: string;
  answer: string;
}
export interface AccordionConfig {
  title?: string;
  items?: AccordionItem[];
  allow_multiple?: boolean;
}
export interface AccordionBlockProps {
  block: PageBlock;
}
