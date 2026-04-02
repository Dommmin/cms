import type { PageBlock } from '@/types/api';

export interface LogoCloudConfig {
    title?: string;
    columns?: number;
    logo_height?: number;
    grayscale?: boolean;
}
export interface LogoCloudProps {
    block: PageBlock;
}
