import type { ReactNode } from 'react';

import type { SectionPadding, SectionVariantKey } from './styles';

export interface SectionProps {
    children: ReactNode;
    className?: string;
    variant?: SectionVariantKey;
    padding?: SectionPadding;
    id?: string;
}
