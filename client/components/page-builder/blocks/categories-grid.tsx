import Image from "next/image";
import Link from "next/link";

import { getRelationsByKey } from "@/lib/format";
import type { Category } from "@/types/api";
import type { CategoriesGridConfig, CategoriesGridProps } from './categories-grid.types';

export function CategoriesGridBlock({ block }: CategoriesGridProps) {
  const cfg = block.configuration as CategoriesGridConfig;
  const columns = cfg.columns ?? 3;

  const categoryRelations = getRelationsByKey(block.relations, "categories");
  const categories = categoryRelations
    .map((r) => r.data as Category | null)
    .filter((c): c is Category => c !== null);

  const colClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
    6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-6",
  }[columns];

  return (
    <div className="flex flex-col gap-8">
      {(cfg.title || cfg.subtitle) && (
        <div className="text-center">
          {cfg.title && <h2 className="text-2xl font-bold md:text-3xl">{cfg.title}</h2>}
          {cfg.subtitle && (
            <p className="mt-2 text-muted-foreground">{cfg.subtitle}</p>
          )}
        </div>
      )}

      <div className={`grid gap-4 ${colClass}`}>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group relative flex aspect-square flex-col items-center justify-end overflow-hidden rounded-2xl bg-muted"
          >
            {cat.image_url && (
              <Image
                src={cat.image_url}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            )}
            <div className="relative z-10 w-full bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="font-semibold text-white">{cat.name}</p>
              {cfg.show_description && cat.description && (
                <p className="text-xs text-white/80">{cat.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
