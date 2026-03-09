import { cn } from "@/lib/utils";
import type { PageSection } from "@/types/api";

import { BlockRenderer } from "./block-renderer";

interface Props {
  section: PageSection;
}

const variantStyles: Record<string, string> = {
  light: "bg-background text-foreground",
  dark: "bg-gray-950 text-white dark:bg-slate-900",
  muted: "bg-muted text-foreground",
  brand: "bg-primary text-primary-foreground",
  hero: "bg-gray-950 text-white dark:bg-slate-900",
};

const layoutContainerStyles: Record<string, string> = {
  contained: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
  "full-width": "w-full",
  flush: "w-full",
  "two-col": "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8",
  "three-col":
    "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8",
};

const sectionPaddingStyles: Record<string, string> = {
  none: "py-0",
  sm: "py-6",
  md: "py-12",
  lg: "py-20",
  xl: "py-28",
};

export function SectionRenderer({ section }: Props) {
  const variant = section.variant ?? "light";
  const layout = section.layout ?? "contained";

  const settings = section.settings as Record<string, string> | null;
  const padding = settings?.padding ?? "lg";

  const sectionBg = variantStyles[variant] ?? "";
  const sectionPadding =
    layout === "flush" ? "" : (sectionPaddingStyles[padding] ?? "py-12");

  const containerClass = layoutContainerStyles[layout] ?? layoutContainerStyles.contained;

  const activeBlocks = section.blocks.filter((b) => b.is_active);

  return (
    <section
      className={cn(sectionBg, sectionPadding)}
      data-section-type={section.section_type}
      data-section-id={section.id}
    >
      <div className={containerClass}>
        {activeBlocks.map((block) => (
          <div key={block.id} className="w-full">
            <BlockRenderer block={block} />
          </div>
        ))}
      </div>
    </section>
  );
}
