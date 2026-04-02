import type { TimelineConfig, TimelineProps } from './timeline.types';

export function TimelineBlock({ block }: TimelineProps) {
    const cfg = block.configuration as TimelineConfig;
    const items = cfg.items ?? [];

    if (items.length === 0) return null;

    return (
        <div className="flex flex-col gap-10">
            {(cfg.title || cfg.subtitle) && (
                <div className="text-center">
                    {cfg.title && (
                        <h2 className="text-2xl font-bold md:text-3xl">
                            {cfg.title}
                        </h2>
                    )}
                    {cfg.subtitle && (
                        <p className="text-muted-foreground mt-2">
                            {cfg.subtitle}
                        </p>
                    )}
                </div>
            )}

            <div className="relative">
                {/* Vertical line */}
                <div className="bg-border absolute top-0 left-4 h-full w-0.5 md:left-8" />

                <div className="flex flex-col gap-8">
                    {items.map((item, i) => (
                        <div
                            key={i}
                            className="relative flex gap-6 pl-12 md:pl-20"
                        >
                            {/* Dot */}
                            <div className="bg-primary ring-background absolute top-1 left-2 flex h-5 w-5 items-center justify-center rounded-full ring-4 md:left-6">
                                <span className="h-2 w-2 rounded-full bg-white" />
                            </div>

                            <div className="flex-1">
                                {item.date && (
                                    <span className="text-primary text-xs font-semibold tracking-widest uppercase">
                                        {item.date}
                                    </span>
                                )}
                                {item.title && (
                                    <h3 className="mt-1 text-lg font-semibold">
                                        {item.title}
                                    </h3>
                                )}
                                {item.description && (
                                    <p className="text-muted-foreground mt-2">
                                        {item.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
