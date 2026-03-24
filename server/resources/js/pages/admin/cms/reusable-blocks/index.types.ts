import type { BlockTypeConfig } from '@/features/page-builder';

export type GlobalBlock = {
    id: number;
    name: string;
    description: string | null;
    type: string;
    is_active: boolean;
    page_blocks_count: number;
    created_at: string;
};
export type IndexProps = {
    blocks: GlobalBlock[];
    available_block_types: Record<string, BlockTypeConfig>;
};
