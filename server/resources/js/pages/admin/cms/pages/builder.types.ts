import type {
    AvailableSection,
    BlockTypeConfig,
    Section,
} from '@/features/page-builder';

export type BuilderPageProps = {
    page: {
        id: number;
        title: string;
        slug: string;
        is_published?: boolean;
    };
    sections: Section[];
    available_sections: Record<string, AvailableSection>;
    available_block_relations: Record<string, BlockTypeConfig>;
};
