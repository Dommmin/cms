import type { Modules } from '@/app/layout.types';

export type HeaderProps = {
    modules?: Modules;
    siteName?: string;
    logoUrl?: string | null;
};
