'use client';

import { useEffect, useRef, useState } from 'react';

import { useInView } from 'framer-motion';

import type { StatsCounterConfig, StatsCounterProps } from './stats-counter.types';

function AnimatedNumber({ value, animate }: { value: string; animate: boolean }) {
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
  const isNumeric = !isNaN(numericValue);

  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayed, setDisplayed] = useState(animate && isNumeric ? 0 : numericValue);

  useEffect(() => {
    if (!animate || !isNumeric || !isInView) return;
    const duration = 1800;
    const start = Date.now();
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * numericValue));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, animate, isNumeric, numericValue]);

  return <span ref={ref}>{isNumeric ? displayed.toLocaleString() : value}</span>;
}

export function StatsCounterBlock({ block }: StatsCounterProps) {
  const cfg = block.configuration as StatsCounterConfig;
  const stats = cfg.stats ?? [];
  const columns = cfg.columns ?? 4;
  const animate = cfg.animate_numbers !== false;
  const style = cfg.style ?? 'plain';

  const colClass =
    {
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-3',
      4: 'grid-cols-2 sm:grid-cols-4',
      5: 'grid-cols-2 sm:grid-cols-5',
    }[columns as 2 | 3 | 4 | 5] ?? 'grid-cols-2 sm:grid-cols-4';

  const itemClass = {
    plain: 'text-center',
    card: 'text-center rounded-xl bg-card border p-6 shadow-sm',
    bordered: 'text-center border-l-4 border-primary pl-6',
    icon: 'text-center',
  }[style];

  if (stats.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      {(cfg.title || cfg.subtitle) && (
        <div className="text-center">
          {cfg.title && <h2 className="text-2xl font-bold md:text-3xl">{cfg.title}</h2>}
          {cfg.subtitle && <p className="text-muted-foreground mt-2">{cfg.subtitle}</p>}
        </div>
      )}
      <div className={`grid gap-8 ${colClass}`}>
        {stats.map((stat, i) => (
          <div key={i} className={itemClass}>
            <div className="text-primary text-4xl font-extrabold md:text-5xl">
              <AnimatedNumber value={stat.value ?? '0'} animate={animate} />
              {stat.suffix && <span>{stat.suffix}</span>}
            </div>
            {stat.label && (
              <p className="text-muted-foreground mt-2 text-sm font-medium tracking-wide uppercase">
                {stat.label}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
