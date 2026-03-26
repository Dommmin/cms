import { router } from '@inertiajs/react';
import { ClockIcon, RotateCcwIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type {
    VersionEntry,
    DiffEntry,
    VersionHistoryProps,
} from './version-history.types';

function formatValue(val: unknown): string {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
}

function eventBadgeVariant(event: string) {
    switch (event) {
        case 'created':
            return 'default';
        case 'deleted':
            return 'destructive';
        case 'restored':
            return 'secondary';
        default:
            return 'outline';
    }
}

function DiffTable({ diff }: { diff: Record<string, DiffEntry> }) {
    const keys = Object.keys(diff);
    if (keys.length === 0)
        return (
            <p className="text-xs text-muted-foreground">
                No field changes recorded.
            </p>
        );

    return (
        <table className="w-full text-xs">
            <thead>
                <tr className="border-b">
                    <th className="py-1 pr-3 text-left font-medium">Field</th>
                    <th className="py-1 pr-3 text-left font-medium text-red-600">
                        Before
                    </th>
                    <th className="py-1 text-left font-medium text-green-600">
                        After
                    </th>
                </tr>
            </thead>
            <tbody>
                {keys.map((key) => (
                    <tr key={key} className="border-b last:border-0">
                        <td className="py-1 pr-3 font-mono">{key}</td>
                        <td className="max-w-[180px] truncate py-1 pr-3 font-mono text-red-600">
                            {formatValue(diff[key].old)}
                        </td>
                        <td className="max-w-[180px] truncate py-1 font-mono text-green-600">
                            {formatValue(diff[key].new)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export function VersionHistory({ modelType, modelId }: VersionHistoryProps) {
    const [open, setOpen] = useState(false);
    const [versions, setVersions] = useState<VersionEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [restoring, setRestoring] = useState<number | null>(null);

    useEffect(() => {
        if (!open) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        fetch(`/admin/versions/${modelType}/${modelId}`)
            .then((r) => r.json())
            .then((data) => setVersions(data.versions ?? []))
            .finally(() => setLoading(false));
    }, [open, modelType, modelId]);

    function handleRestore(versionNumber: number) {
        if (!confirm(`Restore to version ${versionNumber}?`)) return;
        setRestoring(versionNumber);
        router.post(
            `/admin/versions/${modelType}/${modelId}/${versionNumber}/restore`,
            {},
            {
                onFinish: () => {
                    setRestoring(null);
                    setOpen(false);
                },
            },
        );
    }

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
                className="gap-1.5"
            >
                <ClockIcon className="h-3.5 w-3.5" />
                Version History
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Version History</DialogTitle>
                    </DialogHeader>

                    {loading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : versions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No versions recorded yet.
                        </p>
                    ) : (
                        <ul className="space-y-1">
                            {versions.map((v) => (
                                <li key={v.id} className="rounded-md border">
                                    <div
                                        className={cn(
                                            'flex cursor-pointer items-center justify-between gap-2 px-3 py-2',
                                            expandedId === v.id && 'border-b',
                                        )}
                                        onClick={() =>
                                            setExpandedId(
                                                expandedId === v.id
                                                    ? null
                                                    : v.id,
                                            )
                                        }
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 text-xs font-medium text-muted-foreground">
                                                #{v.version_number}
                                            </span>
                                            <Badge
                                                variant={eventBadgeVariant(
                                                    v.event,
                                                )}
                                            >
                                                {v.event}
                                            </Badge>
                                            {v.change_note && (
                                                <span className="text-xs text-muted-foreground">
                                                    {v.change_note}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-muted-foreground">
                                                {v.creator?.name ?? 'System'} ·{' '}
                                                {new Date(
                                                    v.created_at,
                                                ).toLocaleString()}
                                            </span>
                                            {v.event !== 'deleted' &&
                                                v.version_number > 1 && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-6 px-2"
                                                        disabled={
                                                            restoring ===
                                                            v.version_number
                                                        }
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRestore(
                                                                v.version_number,
                                                            );
                                                        }}
                                                    >
                                                        <RotateCcwIcon className="h-3 w-3" />
                                                        Restore
                                                    </Button>
                                                )}
                                        </div>
                                    </div>
                                    {expandedId === v.id && (
                                        <div className="px-3 py-2">
                                            {v.changes ? (
                                                <DiffTable diff={v.changes} />
                                            ) : (
                                                <p className="text-xs text-muted-foreground">
                                                    Initial snapshot — no diff
                                                    available.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
