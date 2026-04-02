import type { PageBlock } from '@/types/api';

export interface TeamMember {
    name?: string;
    role?: string;
    bio?: string;
    photo_url?: string;
    linkedin_url?: string;
    twitter_url?: string;
}
export interface TeamMembersConfig {
    title?: string;
    subtitle?: string;
    columns?: number;
    members?: TeamMember[];
}
export interface TeamMembersProps {
    block: PageBlock;
}
