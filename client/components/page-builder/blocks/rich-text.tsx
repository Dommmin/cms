import type { PageBlock } from "@/types/api";

interface RichTextConfig {
  content?: string;
  text_size?: "sm" | "base" | "lg" | "xl";
}

interface Props {
  block: PageBlock;
}

export function RichTextBlock({ block }: Props) {
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
