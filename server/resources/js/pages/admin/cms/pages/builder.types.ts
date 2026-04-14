import type {
    AvailableSection,
    BlockTypeConfig,
    Section,
} from '@/features/page-builder';

export type ApprovalStatus = 'draft' | 'in_review' | 'approved';

export type BuilderPageProps = {
    page: {
        id: number;
        title: string;
        slug: string;
        is_published?: boolean;
        scheduled_publish_at?: string | null;
        scheduled_unpublish_at?: string | null;
        approval_status?: ApprovalStatus;
        review_note?: string | null;
    };
    sections: Section[];
    available_sections: Record<string, AvailableSection>;
    available_block_relations: Record<string, BlockTypeConfig>;
};
