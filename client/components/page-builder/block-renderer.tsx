import { blockRegistry } from './block-registry';
import {
    BLOCK_NOT_REGISTERED_WARNING,
    isBlockRegistryStrictMode,
    warnBlockNotRegistered,
} from './block-registry-config';
import type { BlockRendererProps } from './block-renderer.types';

function UnknownBlockFallback({ blockType }: { blockType: string }) {
    return (
        <div className="rounded-lg border border-dashed border-amber-400 bg-amber-50 p-4 text-sm text-amber-700">
            Unknown block type: <strong>{blockType}</strong>
        </div>
    );
}

export function BlockRenderer({ block }: BlockRendererProps) {
    const Component = blockRegistry[block.type as keyof typeof blockRegistry];

    if (!Component) {
        warnBlockNotRegistered(block.type);

        if (isBlockRegistryStrictMode()) {
            throw new Error(`${BLOCK_NOT_REGISTERED_WARNING}: ${block.type}`);
        }

        if (process.env.NODE_ENV === 'development') {
            return <UnknownBlockFallback blockType={block.type} />;
        }

        return null;
    }

    return <Component block={block} />;
}
