import type { PageBlock } from "@/types/api";
import type { RichTextConfig, RichTextProps } from './rich-text.types';

export function RichTextBlock({ block }: RichTextProps) {
  const cfg = block.configuration as RichTextConfig;

  const proseSize = {
    sm: "prose-sm",
    base: "",
    lg: "prose-lg",
    xl: "prose-xl",
  }[cfg.text_size ?? "base"];

  if (!cfg.content) return null;

  return (
    <div
      className={`prose max-w-none dark:prose-invert ${proseSize}`}
      dangerouslySetInnerHTML={{ __html: cfg.content }}
    />
  );
}
