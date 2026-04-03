import { sanitizeHtml } from '@/lib/sanitize';
import Image from 'next/image';

import { getRelationByKey } from '@/lib/format';
import type {
    ThreeColumnsConfig,
    ThreeColumnsProps,
} from './three-columns.types';

export function ThreeColumnsBlock({ block }: ThreeColumnsProps) {
    const cfg = block.configuration as ThreeColumnsConfig;

    const columns = [
        {
            title: cfg.column_1_title,
            content: cfg.column_1_content,
            imgRel: getRelationByKey(block.relations, 'column_1_image'),
        },
        {
            title: cfg.column_2_title,
            content: cfg.column_2_content,
            imgRel: getRelationByKey(block.relations, 'column_2_image'),
        },
        {
            title: cfg.column_3_title,
            content: cfg.column_3_content,
            imgRel: getRelationByKey(block.relations, 'column_3_image'),
        },
    ];

    const alignClass = {
        top: 'items-start',
        middle: 'items-center',
        bottom: 'items-end',
    }[cfg.vertical_alignment ?? 'top'];

    return (
        <div className={`grid grid-cols-1 gap-8 md:grid-cols-3 ${alignClass}`}>
            {columns.map((col, i) => {
                const imgUrl = col.imgRel?.metadata?.url as string | undefined;
                const imgAlt = col.imgRel?.metadata?.alt as string | undefined;

                return (
                    <div key={i} className="flex flex-col gap-4">
                        {imgUrl && (
                            <div className="relative aspect-video overflow-hidden rounded-xl">
                                <Image
                                    src={imgUrl}
                                    alt={imgAlt ?? col.title ?? ''}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                        {col.title && (
                            <h3 className="text-xl font-semibold">
                                {col.title}
                            </h3>
                        )}
                        {col.content && (
                            <div
                                className="prose prose-sm dark:prose-invert"
                                dangerouslySetInnerHTML={{
                                    __html: sanitizeHtml(col.content),
                                }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
