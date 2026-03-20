import Image from "next/image";
import Link from "next/link";

import { getRelationByKey } from "@/lib/format";
import type { BlockRelation, PageBlock } from "@/types/api";

interface HeroBannerConfig {
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

interface Props {
  block: PageBlock;
}

export function HeroBannerBlock({ block }: Props) {
  const cfg = block.configuration as HeroBannerConfig;
  const align = cfg.text_alignment ?? "center";
  const minHeight = cfg.min_height ?? 500;
  const overlayOpacity = (cfg.overlay_opacity ?? 40) / 100;

  const bgRelation = getRelationByKey(block.relations, "background");
  const bgUrl = bgRelation?.metadata?.url as string | undefined;

  const alignClass = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
  }[align];

  const ctaClass = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg font-semibold transition-colors",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80 px-8 py-3 rounded-lg font-semibold transition-colors",
    outline:
      "border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-lg font-semibold transition-colors",
    ghost: "text-white hover:bg-white/10 px-8 py-3 rounded-lg font-semibold transition-colors",
  }[cfg.cta_style ?? "primary"];

  return (
    <div
      className="relative flex w-full flex-col justify-center overflow-hidden"
      style={{ minHeight }}
    >
      {/* Background */}
      {bgUrl ? (
        <>
          <Image
            src={bgUrl}
            alt={bgRelation?.metadata?.alt as string ?? cfg.title ?? ""}
            fill
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary/30 to-slate-800" />
      )}

      {/* Content */}
      <div className={`relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-16 ${alignClass}`}>
        {cfg.title && (
          <h1 className="text-4xl font-bold text-white drop-shadow-md md:text-6xl">
            {cfg.title}
          </h1>
        )}
        {cfg.subtitle && (
          <p className="max-w-2xl text-lg text-white/90 drop-shadow md:text-xl">
            {cfg.subtitle}
          </p>
        )}
        {(cfg.cta_text || cfg.cta2_text) && (
          <div className="mt-2 flex flex-wrap gap-4">
            {cfg.cta_text && cfg.cta_url && (
              <Link href={cfg.cta_url} className={ctaClass}>
                {cfg.cta_text}
              </Link>
            )}
            {cfg.cta2_text && cfg.cta2_url && (
              <Link
                href={cfg.cta2_url}
                className={
                  {
                    primary:
                      "bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg font-semibold transition-colors",
                    secondary:
                      "bg-secondary text-secondary-foreground hover:bg-secondary/80 px-8 py-3 rounded-lg font-semibold transition-colors",
                    outline:
                      "border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-lg font-semibold transition-colors",
                    ghost:
                      "text-white hover:bg-white/10 px-8 py-3 rounded-lg font-semibold transition-colors",
                  }[cfg.cta2_style ?? "outline"]
                }
              >
                {cfg.cta2_text}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
