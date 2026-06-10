import { SlidersHorizontalIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { ListFiltersProps } from './list-filters.types';

export default function ListFilters({
    title = 'Filters',
    description = 'Adjust the visible list results.',
    triggerLabel = 'Filters',
    activeCount = 0,
    children,
    className,
    contentClassName,
}: ListFiltersProps) {
    return (
        <div className={cn('space-y-3', className)}>
            <div
                className={cn(
                    'hidden items-center gap-2 sm:flex sm:flex-wrap',
                    contentClassName,
                )}
            >
                {children}
            </div>

            <div className="sm:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-between"
                        >
                            <span className="inline-flex items-center gap-2">
                                <span className="inline-flex items-center gap-2">
                                    <SlidersHorizontalIcon className="h-4 w-4" />
                                    {triggerLabel}
                                </span>
                                {activeCount > 0 && (
                                    <Badge variant="secondary">
                                        {activeCount}
                                    </Badge>
                                )}
                            </span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="max-h-[80vh]">
                        <SheetHeader>
                            <SheetTitle>{title}</SheetTitle>
                            <SheetDescription>{description}</SheetDescription>
                        </SheetHeader>
                        <div
                            className={cn(
                                'flex flex-col gap-3 overflow-y-auto px-4 pb-6',
                                '[&_[data-slot=button]]:w-full',
                                '[&_[data-slot=select-trigger]]:w-full',
                                contentClassName,
                            )}
                        >
                            {children}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}
