import type { HTMLAttributes, ReactNode } from 'react';

import type { StackGap } from './styles';

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    gap?: StackGap;
}
