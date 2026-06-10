import { Link } from '@inertiajs/react';
import { ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type {
    PageHeaderActionsProps,
    PageHeaderOverflowMenuProps,
    PageHeaderProps,
} from './page-header.types';

export function PageHeader({
    title,
    description,
    breadcrumbs,
    children,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn('space-y-4 sm:space-y-5', className)}>
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="hidden flex-wrap items-center gap-1 text-sm text-muted-foreground md:flex">
                    {breadcrumbs.map((item, index) => (
                        <div
                            key={item.href || index}
                            className="flex min-w-0 items-center gap-1"
                        >
                            {index > 0 && (
                                <ChevronRightIcon className="size-4 shrink-0" />
                            )}
                            {item.href ? (
                                <Link
                                    href={item.href}
                                    className="truncate transition-colors hover:text-foreground"
                                    prefetch
                                >
                                    {item.title}
                                </Link>
                            ) : (
                                <span className="truncate text-foreground">
                                    {item.title}
                                </span>
                            )}
                        </div>
                    ))}
                </nav>
            )}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        {title}
                    </h1>
                    {description && (
                        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                {children}
            </div>
        </div>
    );
}

export function PageHeaderActions({
    children,
    className,
    compact = false,
}: PageHeaderActionsProps) {
    return (
        <div
            className={cn(
                'flex w-full flex-row flex-wrap items-center gap-2 sm:w-auto sm:justify-end [&_[data-slot=button]]:h-8 [&_[data-slot=button]]:px-3 [&_[data-slot=button]]:text-xs sm:[&_[data-slot=button]]:h-9 sm:[&_[data-slot=button]]:px-4 sm:[&_[data-slot=button]]:text-sm',
                !compact && '[&>*]:shrink-0',
                className,
            )}
        >
            {children}
        </div>
    );
}

export function PageHeaderOverflowMenu({
    children,
    className,
    label = 'More actions',
}: PageHeaderOverflowMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn('gap-1.5', className)}
                >
                    <MoreHorizontalIcon className="h-4 w-4" />
                    {label}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-56 p-2 sm:w-64 [&_[data-slot=button]]:w-full [&_[data-slot=button]]:justify-start"
            >
                <div className="flex flex-col gap-2">{children}</div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
