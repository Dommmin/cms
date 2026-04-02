import AccordionBlock from '@/components/blocks/accordion';
import type { Block } from './block-renderer.types';

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
    return (
        <>
            {blocks.map((block, idx) => {
                const { type, data } = block;
                switch (type) {
                    case 'accordion':
                        return (
                            <AccordionBlock
                                key={idx}
                                heading={data?.heading}
                                items={
                                    Array.isArray(data?.items) ? data.items : []
                                }
                            />
                        );
                    default:
                        return null;
                }
            })}
        </>
    );
}
