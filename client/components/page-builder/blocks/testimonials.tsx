import { Star } from 'lucide-react';
import Image from 'next/image';

import { BlockHeader } from '@/components/composition';
import { cn } from '@/lib/utils';

import type {
    TestimonialsConfig,
    TestimonialsProps,
} from './testimonials.types';

export function TestimonialsBlock({ block }: TestimonialsProps) {
    const cfg = block.configuration as TestimonialsConfig;
    const columns = cfg.columns ?? 3;
    const items = cfg.items ?? [];

    if (items.length === 0) return null;

    const colClass = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-3',
    }[columns];

    return (
        <div className="flex flex-col gap-8">
            <BlockHeader
                title={cfg.title}
                description={cfg.subtitle}
                align="center"
            />

            <div className={`grid gap-6 ${colClass}`}>
                {items.map((item, i) => (
                    <div
                        key={i}
                        className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-6"
                    >
                        {item.rating && (
                            <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, si) => (
                                    <Star
                                        key={si}
                                        aria-hidden="true"
                                        className={cn(
                                            'h-4 w-4',
                                            si < item.rating!
                                                ? 'fill-[var(--store-accent-amber)] text-[var(--store-accent-amber)]'
                                                : 'text-muted',
                                        )}
                                    />
                                ))}
                            </div>
                        )}
                        <p className="text-muted-foreground flex-1">
                            &ldquo;{item.content}&rdquo;
                        </p>
                        <div className="flex items-center gap-3">
                            {item.avatar_url ? (
                                <Image
                                    src={item.avatar_url}
                                    alt={item.author}
                                    width={40}
                                    height={40}
                                    className="h-10 w-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold">
                                    {item.author?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="font-semibold">{item.author}</p>
                                {item.role && (
                                    <p className="text-muted-foreground text-xs">
                                        {item.role}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
