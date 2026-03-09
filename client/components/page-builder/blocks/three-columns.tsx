import Image from "next/image";

import { getRelationsByKey } from "@/lib/format";
import type { PageBlock } from "@/types/api";

interface Column {
  title?: string;
  content?: string;
  icon?: string;
}

interface ThreeColumnsConfig {
  title?: string;
  subtitle?: string;
  columns?: Column[];
  show_images?: boolean;
}

interface Props {
  block: PageBlock;
}

export function ThreeColumnsBlock({ block }: Props) {
  const cfg = block.configuration as ThreeColumnsConfig;
  const columns = cfg.columns ?? [];
  const imageRelations = cfg.show_images
    ? getRelationsByKey(block.relations, "column_images")
    : [];

  return (
    <div className="flex flex-col gap-10">
      {(cfg.title || cfg.subtitle) && (
        <div className="text-center">
          {cfg.title && <h2 className="text-2xl font-bold md:text-3xl">{cfg.title}</h2>}
          {cfg.subtitle && <p className="mt-2 text-muted-foreground">{cfg.subtitle}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {columns.map((col, i) => {
          const imgRel = imageRelations[i];
          const imgUrl = imgRel?.metadata?.url as string | undefined;

          return (
            <div key={i} className="flex flex-col gap-4">
              {imgUrl && (
                <div className="relative aspect-video overflow-hidden rounded-xl">
                  <Image
                    src={imgUrl}
                    alt={imgRel?.metadata?.alt as string ?? col.title ?? ""}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {col.icon && !imgUrl && (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                  {col.icon}
                </div>
              )}
              {col.title && <h3 className="text-xl font-semibold">{col.title}</h3>}
              {col.content && (
                <div
                  className="prose prose-sm dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: col.content }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
