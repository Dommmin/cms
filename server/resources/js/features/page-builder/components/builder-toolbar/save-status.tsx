import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import type { SaveStatusProps } from '../builder-toolbar.types';

function formatTimeSince(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60_000);

    if (diffMin < 1) return 'just now';
    if (diffMin === 1) return '1 min ago';

    return `${diffMin} min ago`;
}

export function SaveStatus({
    isSaving,
    hasUnsavedChanges,
    lastSavedAt,
}: SaveStatusProps) {
    const __ = useTranslation();
    const [, setTick] = useState(0);

    useEffect(() => {
        if (!lastSavedAt) return;

        const id = setInterval(() => setTick((n) => n + 1), 30_000);

        return () => clearInterval(id);
    }, [lastSavedAt]);

    const timeSince = lastSavedAt ? formatTimeSince(lastSavedAt) : null;

    if (isSaving) {
        return (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>{__('builder.saving', 'Saving...')}</span>
            </div>
        );
    }

    if (hasUnsavedChanges) {
        return (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>{__('builder.unsaved_changes', 'Unsaved changes')}</span>
            </div>
        );
    }

    if (lastSavedAt) {
        return (
            <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span>
                    {__('builder.saved', 'Saved')}{' '}
                    {timeSince ?? __('builder.just_now', 'just now')}
                </span>
            </div>
        );
    }

    return null;
}
