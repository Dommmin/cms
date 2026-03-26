import { usePage } from '@inertiajs/react';

import { SidebarProvider } from '@/components/ui/sidebar';
import type { AppShellProps } from './app-shell.types';

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const isOpen = usePage().props.sidebarOpen;

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">{children}</div>
        );
    }

    return <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>;
}
