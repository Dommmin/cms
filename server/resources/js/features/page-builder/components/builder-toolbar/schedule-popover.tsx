import { Calendar } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useTranslation } from '@/hooks/use-translation';
import type { SchedulePopoverProps } from '../builder-toolbar.types';

function toLocalDateTimeValue(iso: string | null): string {
    if (!iso) return '';

    const d = new Date(iso);

    if (isNaN(d.getTime())) return '';

    return d.toISOString().slice(0, 16);
}

export function SchedulePopover({
    scheduledPublishAt,
    scheduledUnpublishAt,
    onSave,
}: SchedulePopoverProps) {
    const __ = useTranslation();
    const [publishAt, setPublishAt] = useState(
        toLocalDateTimeValue(scheduledPublishAt),
    );
    const [unpublishAt, setUnpublishAt] = useState(
        toLocalDateTimeValue(scheduledUnpublishAt),
    );
    const [open, setOpen] = useState(false);
    const hasSchedule = !!scheduledPublishAt || !!scheduledUnpublishAt;

    const handleSave = () => {
        onSave(publishAt || null, unpublishAt || null);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={hasSchedule ? 'secondary' : 'outline'}
                    size="sm"
                    title={__(
                        'builder.schedule_publishing',
                        'Schedule publishing',
                    )}
                >
                    <Calendar className="mr-2 h-4 w-4" />
                    {__('builder.schedule', 'Schedule')}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold">
                        {__(
                            'builder.schedule_publishing',
                            'Schedule Publishing',
                        )}
                    </h4>

                    <div className="space-y-1.5">
                        <Label htmlFor="scheduled-publish-at">
                            {__('builder.publish_at', 'Publish at')}
                        </Label>
                        <input
                            id="scheduled-publish-at"
                            type="datetime-local"
                            value={publishAt}
                            onChange={(e) => setPublishAt(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            {__(
                                'builder.publish_at_hint',
                                'Page will be automatically published at this time.',
                            )}
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="scheduled-unpublish-at">
                            {__('builder.unpublish_at', 'Unpublish at')}
                        </Label>
                        <input
                            id="scheduled-unpublish-at"
                            type="datetime-local"
                            value={unpublishAt}
                            onChange={(e) => setUnpublishAt(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            {__(
                                'builder.unpublish_at_hint',
                                'Page will be automatically unpublished at this time.',
                            )}
                        </p>
                    </div>

                    <div className="flex justify-between gap-2">
                        {hasSchedule && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                    setPublishAt('');
                                    setUnpublishAt('');
                                    onSave(null, null);
                                    setOpen(false);
                                }}
                            >
                                {__('builder.clear_schedule', 'Clear schedule')}
                            </Button>
                        )}
                        <Button
                            size="sm"
                            className="ml-auto"
                            onClick={handleSave}
                        >
                            {__('builder.save_schedule', 'Save schedule')}
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
