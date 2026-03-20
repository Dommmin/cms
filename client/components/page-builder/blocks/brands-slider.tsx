import Image from "next/image";

import { getRelationsByKey } from "@/lib/format";
import type { Brand, PageBlock } from "@/types/api";

interface BrandsSliderConfig {
  title?: string;
  source?: "all" | "manual";
  speed?: "slow" | "normal" | "fast";
  logo_height?: number;
  grayscale?: boolean;
}

interface Props {
  block: PageBlock;
}

const speedDuration: Record<string, string> = {
  slow: "60s",
  normal: "35s",
  fast: "18s",
};

export function BrandsSliderBlock({ block }: Props) {
  const cfg = block.configuration as BrandsSliderConfig;
  const logoHeight = cfg.logo_height ?? 48;
  const grayscale = cfg.grayscale !== false;
  const duration = speedDuration[cfg.speed ?? "normal"];

  const brandRelations = getRelationsByKey(block.relations, "brands");
  const brands = brandRelations
    .map((r) => r.data as Brand | null)
    .filter((b): b is Brand => b !== null);

  if (brands.length === 0) return null;

  // Duplicate the list for seamless infinite scroll
  const items = [...brands, ...brands];

  return (
    <div className="flex flex-col gap-8 overflow-hidden">
      {cfg.title && (
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {cfg.title}
        </p>
      )}

      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div
          className="flex w-max animate-marquee gap-12"
          style={{ "--marquee-duration": duration } as React.CSSProperties}
        >
          {items.map((brand, i) => (
            <div
              key={`${brand.id}-${i}`}
              className={`flex shrink-0 items-center transition-all duration-300 ${
                grayscale ? "grayscale hover:grayscale-0" : ""
              } opacity-70 hover:opacity-100`}
            >
              {brand.logo_url ? (
                <Image
                  src={brand.logo_url}
                  alt={brand.name}
                  width={160}
                  height={logoHeight}
                  className="object-contain"
                  style={{ height: logoHeight, width: "auto" }}
                />
              ) : (
                <span className="text-sm font-semibold text-muted-foreground">{brand.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
