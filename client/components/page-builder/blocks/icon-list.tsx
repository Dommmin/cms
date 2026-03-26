import { cn } from '@/lib/utils';
import type { IconListConfig, IconListProps } from './icon-list.types';

// Simple icon map — renders emoji or text fallback (full Lucide dynamic import avoided for bundle size)
function BlockIcon({ name, color }: { name?: string; color?: string }) {
  const iconMap: Record<string, string> = {
    check: '✓',
    star: '★',
    bolt: '⚡',
    heart: '♥',
    shield: '🛡',
    lock: '🔒',
    truck: '🚚',
    clock: '⏱',
    globe: '🌍',
    phone: '📞',
    mail: '✉',
    users: '👥',
    chart: '📊',
    rocket: '🚀',
    leaf: '🍃',
    sun: '☀',
    moon: '🌙',
    zap: '⚡',
    award: '🏆',
    gift: '🎁',
    tag: '🏷',
    settings: '⚙',
    code: '💻',
    camera: '📷',
    music: '🎵',
    video: '🎬',
    file: '📄',
    folder: '📁',
  };
  const symbol = (name && iconMap[name]) ?? '●';
  return (
    <span
      className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
      style={color ? { color } : undefined}
    >
      {symbol}
    </span>
  );
}

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
      {(cfg.title || cfg.subtitle) && (
        <div className="text-center">
          {cfg.title && <h2 className="text-2xl font-bold md:text-3xl">{cfg.title}</h2>}
          {cfg.subtitle && <p className="text-muted-foreground mt-2">{cfg.subtitle}</p>}
        </div>
      )}

      <div className={cn('grid gap-6', colClass)}>
        {items.map((item, i) => (
          <div
            key={i}
            className={cn(
              style === 'centered' && 'flex flex-col items-center gap-3 text-center',
              style === 'horizontal' && 'flex items-start gap-4',
              style === 'compact' && 'flex items-center gap-3',
            )}
          >
            <BlockIcon name={item.icon} color={cfg.icon_color} />
            <div>
              {item.title && (
                <p className={cn('font-semibold', style === 'compact' ? 'text-sm' : 'text-base')}>
                  {item.title}
                </p>
              )}
              {item.description && style !== 'compact' && (
                <p className="text-muted-foreground mt-1 text-sm">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
