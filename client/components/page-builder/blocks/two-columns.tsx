import Image from 'next/image';

import { getRelationByKey } from '@/lib/format';
import type { TwoColumnsConfig, TwoColumnsProps } from './two-columns.types';

export function TwoColumnsBlock({ block }: TwoColumnsProps) {
  const cfg = block.configuration as TwoColumnsConfig;
  const layout = cfg.layout ?? 'text-text';
  const ratio = cfg.ratio ?? '50-50';
  const gap = cfg.gap ?? 'md';

  const leftImageRelation = getRelationByKey(block.relations, 'left_image');
  const rightImageRelation = getRelationByKey(block.relations, 'right_image');

  const gapClass = { sm: 'gap-6', md: 'gap-12', lg: 'gap-20' }[gap];
  const alignClass = {
    top: 'items-start',
    center: 'items-center',
    bottom: 'items-end',
  }[cfg.vertical_align ?? 'center'];

  const leftClass = ratio === '60-40' ? 'md:col-span-3' : ratio === '40-60' ? 'md:col-span-2' : '';
  const rightClass = ratio === '60-40' ? 'md:col-span-2' : ratio === '40-60' ? 'md:col-span-3' : '';
  const gridCols = ratio === '50-50' ? 'md:grid-cols-2' : 'md:grid-cols-5';

  const renderLeft = () => {
    if (layout.startsWith('image') && leftImageRelation?.metadata?.url) {
      const url = leftImageRelation.metadata.url as string;
      return (
        <div className="relative aspect-video overflow-hidden rounded-2xl">
          <Image
            src={url}
            alt={(leftImageRelation.metadata?.alt as string) ?? ''}
            fill
            className="object-cover"
          />
        </div>
      );
    }
    return (
      <div>
        {cfg.left_title && <h3 className="mb-3 text-2xl font-bold">{cfg.left_title}</h3>}
        {cfg.left_content && (
          <div
            className="prose dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: cfg.left_content }}
          />
        )}
      </div>
    );
  };

  const renderRight = () => {
    if (layout.endsWith('image') && rightImageRelation?.metadata?.url) {
      const url = rightImageRelation.metadata.url as string;
      return (
        <div className="relative aspect-video overflow-hidden rounded-2xl">
          <Image
            src={url}
            alt={(rightImageRelation.metadata?.alt as string) ?? ''}
            fill
            className="object-cover"
          />
        </div>
      );
    }
    return (
      <div>
        {cfg.right_title && <h3 className="mb-3 text-2xl font-bold">{cfg.right_title}</h3>}
        {cfg.right_content && (
          <div
            className="prose dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: cfg.right_content }}
          />
        )}
      </div>
    );
  };

  return (
    <div className={`grid ${gridCols} ${gapClass} ${alignClass}`}>
      <div className={leftClass}>{renderLeft()}</div>
      <div className={rightClass}>{renderRight()}</div>
    </div>
  );
}
