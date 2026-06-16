import type { ReactNode } from 'react';

export interface ContainerProps {
    children: ReactNode;
    className?: string;
    narrow?: boolean;
    wide?: boolean;
}
