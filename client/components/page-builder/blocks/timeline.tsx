import type { PageBlock } from "@/types/api";

interface TimelineItem {
  date?: string;
  title?: string;
  description?: string;
  icon?: string;
}

interface TimelineConfig {
  title?: string;
  subtitle?: string;
  layout?: "left" | "center" | "right";
  items?: TimelineItem[];
}

interface Props {
  block: PageBlock;
}

export function TimelineBlock({ block }: Props) {
  const cfg = block.configuration as TimelineConfig;
  const items = cfg.items ?? [];

  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-10">
      {(cfg.title || cfg.subtitle) && (
        <div className="text-center">
          {cfg.title && <h2 className="text-2xl font-bold md:text-3xl">{cfg.title}</h2>}
          {cfg.subtitle && <p className="mt-2 text-muted-foreground">{cfg.subtitle}</p>}
        </div>
      )}

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 h-full w-0.5 bg-border md:left-8" />

        <div className="flex flex-col gap-8">
          {items.map((item, i) => (
            <div key={i} className="relative flex gap-6 pl-12 md:pl-20">
              {/* Dot */}
              <div className="absolute left-2 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary ring-4 ring-background md:left-6">
                <span className="h-2 w-2 rounded-full bg-white" />
              </div>

              <div className="flex-1">
                {item.date && (
                  <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                    {item.date}
                  </span>
                )}
                {item.title && (
                  <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
                )}
                {item.description && (
                  <p className="mt-2 text-muted-foreground">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
