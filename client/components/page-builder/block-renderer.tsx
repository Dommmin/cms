'use client';

import { blockRegistry } from './block-registry';
import {
    BLOCK_NOT_REGISTERED_WARNING,
    warnBlockNotRegistered,
} from './block-registry-config';
import type { BlockRendererProps } from './block-renderer.types';
import { usePreRenderBlockValidation } from './use-pre-render-block-validation';

export function BlockRenderer({ block }: BlockRendererProps) {
    usePreRenderBlockValidation(block.type);

    const Component = blockRegistry[block.type as keyof typeof blockRegistry];

    if (!Component) {
        warnBlockNotRegistered(block.type);
        throw new Error(`${BLOCK_NOT_REGISTERED_WARNING}: ${block.type}`);
    }

    return <Component block={block} />;
}
