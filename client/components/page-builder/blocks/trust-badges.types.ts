import type { PageBlock } from '@/types/api';

export interface Badge {
    icon?: string;
    label?: string;
    sublabel?: string;
}
export interface TrustBadgesConfig {
    style?: 'row' | 'card' | 'minimal';
    badges?: Badge[];
}
export interface TrustBadgesProps {
    block: PageBlock;
}
