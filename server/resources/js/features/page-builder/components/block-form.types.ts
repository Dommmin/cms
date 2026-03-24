import type { Block, BlockTypeConfig } from '../types';

export type BlockFormProps = {
    block: Block;
    availableBlockTypes: Record<string, BlockTypeConfig>;
    onUpdate: (patch: Partial<Block>) => void;
    onUnlinkReusable?: () => void;
};
