import Image from "next/image";

import { getRelationsByKey } from "@/lib/format";
import type { PageBlock } from "@/types/api";

interface ImageGalleryConfig {
  title?: string;
  columns?: 2 | 3 | 4;
  aspect?: "square" | "video" | "portrait";
}

interface Props {
  block: PageBlock;
}

export function ImageGalleryBlock({ block }: Props) {
  const cfg = block.configuration as ImageGalleryConfig;
  const columns = cfg.columns ?? 3;
  const aspect = cfg.aspect ?? "square";

  const imageRelations = getRelationsByKey(block.relations, "images");

  const colClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  }[columns];

  const aspectClass = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
  }[aspect];

  return (
    <div className="flex flex-col gap-6">
      {cfg.title && <h2 className="text-2xl font-bold">{cfg.title}</h2>}
      <div className={`grid gap-3 ${colClass}`}>
        {imageRelations.map((rel, i) => {
          const url = rel.metadata?.url as string | undefined;
          const alt = rel.metadata?.alt as string | undefined;
          if (!url) return null;
          return (
            <div key={rel.id ?? i} className={`relative overflow-hidden rounded-xl ${aspectClass}`}>
              <Image
                src={url}
                alt={alt ?? `Gallery image ${i + 1}`}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
