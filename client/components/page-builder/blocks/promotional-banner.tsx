import Image from "next/image";
import Link from "next/link";

import { getRelationByKey } from "@/lib/format";
import type { PageBlock } from "@/types/api";

interface PromotionalBannerConfig {
  title?: string;
  subtitle?: string;
  badge_text?: string;
  cta_text?: string;
  cta_url?: string;
  layout?: "left" | "right" | "center";
  background_color?: string;
}

interface Props {
  block: PageBlock;
}

export function PromotionalBannerBlock({ block }: Props) {
  const cfg = block.configuration as PromotionalBannerConfig;
  const layout = cfg.layout ?? "left";

  const bgRelation = getRelationByKey(block.relations, "background");
  const bgUrl = bgRelation?.metadata?.url as string | undefined;

  const isCenter = layout === "center";
  const isRight = layout === "right";

  return (
    <div
      className="relative flex min-h-64 overflow-hidden rounded-2xl"
      style={{ backgroundColor: cfg.background_color ?? undefined }}
    >
      {bgUrl && (
        <>
          <Image
            src={bgUrl}
            alt={cfg.title ?? "Promotion"}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </>
      )}

      <div
        className={`relative z-10 flex flex-col justify-center gap-4 p-8 md:p-12 ${
          isCenter ? "mx-auto text-center" : isRight ? "ml-auto" : ""
        } max-w-xl`}
      >
        {cfg.badge_text && (
          <span className="w-fit rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
            {cfg.badge_text}
          </span>
        )}
        {cfg.title && (
          <h2 className={`text-3xl font-bold ${bgUrl ? "text-white" : ""} md:text-4xl`}>
            {cfg.title}
          </h2>
        )}
        {cfg.subtitle && (
          <p className={`text-lg ${bgUrl ? "text-white/90" : "text-muted-foreground"}`}>
            {cfg.subtitle}
          </p>
        )}
        {cfg.cta_text && cfg.cta_url && (
          <div>
            <Link
              href={cfg.cta_url}
              className="inline-block rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {cfg.cta_text}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
