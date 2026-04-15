'use client';
import { useLiveCounter } from '@/hooks/use-live-counter';

export function LiveViewers({
    min = 3,
    max = 28,
}: {
    min?: number;
    max?: number;
}) {
    const count = useLiveCounter(min, max);
    return (
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <span>{count} osób ogląda teraz</span>
        </div>
    );
}
