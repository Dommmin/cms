import type { TrustBadgesConfig, TrustBadgesProps } from './trust-badges.types';

const iconMap: Record<string, string> = {
  truck: '🚚',
  shield: '🛡',
  return: '↩',
  lock: '🔒',
  star: '★',
  check: '✓',
  clock: '⏱',
  gift: '🎁',
  award: '🏆',
  leaf: '🍃',
  heart: '♥',
  users: '👥',
  phone: '📞',
  mail: '✉',
  globe: '🌍',
};

export function TrustBadgesBlock({ block }: TrustBadgesProps) {
  const cfg = block.configuration as TrustBadgesConfig;
  const badges = cfg.badges ?? [];
  const style = cfg.style ?? 'row';

  if (badges.length === 0) return null;

  if (style === 'minimal') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-6">
        {badges.map((badge, i) => (
          <div key={i} className="text-muted-foreground flex items-center gap-2 text-sm">
            <span className="text-base">{iconMap[badge.icon ?? 'check'] ?? '✓'}</span>
            <span className="font-medium">{badge.label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (style === 'card') {
    return (
      <div
        className={`grid gap-4 ${
          badges.length <= 2
            ? 'grid-cols-2'
            : badges.length === 3
              ? 'grid-cols-3'
              : 'grid-cols-2 sm:grid-cols-4'
        }`}
      >
        {badges.map((badge, i) => (
          <div
            key={i}
            className="bg-card flex flex-col items-center gap-2 rounded-xl border p-4 text-center shadow-sm"
          >
            <span className="text-2xl">{iconMap[badge.icon ?? 'check'] ?? '✓'}</span>
            {badge.label && <p className="text-sm font-semibold">{badge.label}</p>}
            {badge.sublabel && <p className="text-muted-foreground text-xs">{badge.sublabel}</p>}
          </div>
        ))}
      </div>
    );
  }

  // Default: row
  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      {badges.map((badge, i) => (
        <div key={i} className="flex flex-col items-center gap-1 text-center">
          <span className="text-3xl">{iconMap[badge.icon ?? 'check'] ?? '✓'}</span>
          {badge.label && <p className="text-sm font-semibold">{badge.label}</p>}
          {badge.sublabel && <p className="text-muted-foreground text-xs">{badge.sublabel}</p>}
        </div>
      ))}
    </div>
  );
}
