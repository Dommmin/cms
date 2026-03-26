import Image from 'next/image';

import { getRelationsByKey } from '@/lib/format';
import type { LogoCloudConfig, LogoCloudProps } from './logo-cloud.types';

export function LogoCloudBlock({ block }: LogoCloudProps) {
  const cfg = block.configuration as LogoCloudConfig;
  const columns = cfg.columns ?? 5;
  const logoHeight = cfg.logo_height ?? 40;
  const grayscale = cfg.grayscale !== false;

  const logoRelations = getRelationsByKey(block.relations, 'logos');
  const logos = logoRelations.filter((r) => r.metadata?.url);

  if (logos.length === 0) return null;

  const colClass =
    {
      2: 'grid-cols-2',
      3: 'grid-cols-2 sm:grid-cols-3',
      4: 'grid-cols-2 sm:grid-cols-4',
      5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5',
      6: 'grid-cols-3 sm:grid-cols-6',
      7: 'grid-cols-3 sm:grid-cols-7',
      8: 'grid-cols-4 sm:grid-cols-8',
    }[columns as 2 | 3 | 4 | 5 | 6 | 7 | 8] ?? 'grid-cols-2 sm:grid-cols-5';

  return (
    <div className="flex flex-col gap-8">
      {cfg.title && (
        <p className="text-muted-foreground text-center text-sm font-semibold tracking-widest uppercase">
          {cfg.title}
        </p>
      )}
      <div className={`grid ${colClass} items-center gap-8`}>
        {logos.map((logo, i) => (
          <div
            key={i}
            className={`flex items-center justify-center transition-all duration-300 ${
              grayscale ? 'grayscale hover:grayscale-0' : ''
            } opacity-60 hover:opacity-100`}
          >
            <Image
              src={logo.metadata?.url as string}
              alt={`Logo ${i + 1}`}
              width={160}
              height={logoHeight}
              className="object-contain"
              style={{ height: logoHeight, width: 'auto' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
