import type { HTMLAttributes, ReactNode } from 'react';

import type { SurfaceVariant } from './styles';

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    variant?: SurfaceVariant;
}
