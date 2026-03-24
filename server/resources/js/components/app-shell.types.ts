import type { ReactNode } from 'react';

export type AppShellProps = {
    children: ReactNode;
    variant?: 'header' | 'sidebar';
};
