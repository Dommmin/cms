import Image from "next/image";
import Link from "next/link";

import { getRelationsByKey } from "@/lib/format";
import type { PageBlock } from "@/types/api";
import type { CallToActionConfig, CallToActionProps } from './call-to-action.types';

export function CallToActionBlock({ block }: CallToActionProps) {
  const cfg = block.configuration as CallToActionConfig;
  const alignment = cfg.alignment ?? "center";
  const style = cfg.style ?? "gradient";

  const bgMedia = getRelationsByKey(block.relations, "background")[0];
  const bgImageUrl = bgMedia?.metadata?.url as string | undefined;

  const alignClass = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
  }[alignment];

  const containerStyle = {
    plain: "bg-background",
    gradient: "bg-gradient-to-r from-primary to-primary/80",
    dark: "bg-gray-950 text-white",
    brand: "bg-primary text-primary-foreground",
    image: "relative bg-gray-950 text-white overflow-hidden",
  }[style];

  const isLight = style === "plain";

  return (
    <div className={`relative rounded-2xl px-8 py-16 ${containerStyle}`}>
      {style === "image" && bgImageUrl && (
        <Image
          src={bgImageUrl}
          alt=""
          fill
          className="object-cover opacity-30"
        />
      )}
      <div className={`relative flex flex-col gap-6 ${alignClass}`}>
        {cfg.badge_text && (
          <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            {cfg.badge_text}
          </span>
        )}
        {cfg.title && (
          <h2
            className={`max-w-3xl text-3xl font-bold md:text-4xl ${isLight ? "text-foreground" : "text-white"}`}
          >
            {cfg.title}
          </h2>
        )}
        {cfg.subtitle && (
          <p
            className={`max-w-2xl text-lg ${isLight ? "text-muted-foreground" : "text-white/80"}`}
          >
            {cfg.subtitle}
          </p>
        )}
        {(cfg.primary_label || cfg.secondary_label) && (
          <div className={`flex flex-wrap gap-4 ${alignment === "center" ? "justify-center" : ""}`}>
            {cfg.primary_label && cfg.primary_url && (
              <Link
                href={cfg.primary_url}
                className={`rounded-lg px-8 py-3 font-semibold transition-opacity hover:opacity-90 ${
                  isLight
                    ? "bg-primary text-primary-foreground"
                    : "bg-white text-gray-950"
                }`}
              >
                {cfg.primary_label}
              </Link>
            )}
            {cfg.secondary_label && cfg.secondary_url && (
              <Link
                href={cfg.secondary_url}
                className={`rounded-lg border-2 px-8 py-3 font-semibold transition-colors ${
                  isLight
                    ? "border-primary text-primary hover:bg-primary/5"
                    : "border-white text-white hover:bg-white/10"
                }`}
              >
                {cfg.secondary_label}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
