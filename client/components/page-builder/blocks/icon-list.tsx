import { cn } from '@/lib/utils';

import { BlockHeader } from '@/components/composition';

import { BlockIcon } from './block-icon';
import type { IconListConfig, IconListProps } from './icon-list.types';

export function IconListBlock({ block }: IconListProps) {
    const cfg = block.configuration as IconListConfig;
    const items = cfg.items ?? [];
    const columns = cfg.columns ?? 2;
    const style = cfg.style ?? 'horizontal';

    const colClass =
        {
            1: 'grid-cols-1',
            2: 'grid-cols-1 sm:grid-cols-2',
            3: 'grid-cols-1 sm:grid-cols-3',
            4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        }[columns as 1 | 2 | 3 | 4] ?? 'grid-cols-1 sm:grid-cols-2';

    if (items.length === 0) return null;

    return (
        <div className="flex flex-col gap-10">
            <BlockHeader
                title={cfg.title}
                description={cfg.subtitle}
                align="center"
            />

            <div className={cn('grid gap-6', colClass)}>
                {items.map((item, i) => (
                    <div
                        key={i}
                        className={cn(
                            style === 'centered' &&
                                'flex flex-col items-center gap-3 text-center',
                            style === 'horizontal' && 'flex items-start gap-4',
                            style === 'compact' && 'flex items-center gap-3',
                        )}
                    >
                        <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                            <BlockIcon
                                name={item.icon}
                                color={cfg.icon_color}
                                size="md"
                            />
                        </div>
                        <div>
                            {item.title && (
                                <p
                                    className={cn(
                                        'font-[family-name:var(--font-heading)] font-semibold',
                                        style === 'compact'
                                            ? 'text-[length:var(--h4-size,1.25rem)]'
                                            : 'text-[length:var(--text-base-size,1rem)]',
                                    )}
                                >
                                    {item.title}
                                </p>
                            )}
                            {item.description && style !== 'compact' && (
                                <p className="text-muted-foreground mt-1 text-sm">
                                    {item.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
