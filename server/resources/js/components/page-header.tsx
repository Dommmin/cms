import { Link } from '@inertiajs/react';
import { ChevronRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
    PageHeaderProps,
    PageHeaderActionsProps,
} from './page-header.types';

export function PageHeader({
    title,
    description,
    breadcrumbs,
    children,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn('space-y-4', className)}>
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-1 text-sm text-muted-foreground">
                    {breadcrumbs.map((item, index) => (
                        <div
                            key={item.href || index}
                            className="flex items-center gap-1"
                        >
                            {index > 0 && (
                                <ChevronRightIcon className="size-4" />
                            )}
                            {item.href ? (
                                <Link
                                    href={item.href}
                                    className="transition-colors hover:text-foreground"
                                    prefetch
                                >
                                    {item.title}
                                </Link>
                            ) : (
                                <span className="text-foreground">
                                    {item.title}
                                </span>
                            )}
                        </div>
                    ))}
                </nav>
            )}

            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm text-muted-foreground">
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
}: PageHeaderActionsProps) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            {children}
        </div>
    );
}
