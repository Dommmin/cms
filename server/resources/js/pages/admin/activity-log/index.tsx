import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import DataTable from '@/components/data-table';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { ActivityLog, IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Activity Log', href: '/admin/activity-log' },
];

const EVENT_COLORS: Record<string, 'default' | 'secondary' | 'destructive'> = {
    created: 'default',
    updated: 'secondary',
    deleted: 'destructive',
};

function ChangeDiff({ properties }: { properties: ActivityLog['properties'] }) {
    if (!properties?.old && !properties?.attributes) return null;
    const old = properties.old ?? {};
    const next = properties.attributes ?? {};
    const keys = Array.from(
        new Set([...Object.keys(old), ...Object.keys(next)]),
    );
    if (keys.length === 0) return null;

    return (
        <div className="space-y-0.5 text-xs">
            {keys.map((key) => (
                <div key={key} className="flex items-center gap-1">
                    <span className="font-mono text-muted-foreground">
                        {key}:
                    </span>
                    {old[key] !== undefined && (
                        <span className="rounded bg-red-50 px-1 text-red-700 line-through dark:bg-red-950/30 dark:text-red-400">
                            {String(old[key])}
                        </span>
                    )}
                    {next[key] !== undefined && (
                        <span className="rounded bg-green-50 px-1 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                            {String(next[key])}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}

export default function ActivityLogIndex({
    activities,
    users,
    log_names,
    filters,
}: IndexProps) {
    const [localFilters, setLocalFilters] = useState(filters);

    const applyFilters = () => {
        router.get(
            '/admin/activity-log',
            localFilters as Record<string, string>,
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        setLocalFilters({});
        router.get(
            '/admin/activity-log',
            {},
            { preserveState: true, replace: true },
        );
    };

    const columns: ColumnDef<ActivityLog>[] = [
        {
            accessorKey: 'created_at',
            header: 'Date',
            cell: ({ row }) => (
                <span className="text-xs whitespace-nowrap text-muted-foreground">
                    {new Date(row.original.created_at).toLocaleString()}
                </span>
            ),
        },
        {
            accessorKey: 'causer',
            header: 'User',
            cell: ({ row }) =>
                row.original.causer ? (
                    <div>
                        <p className="text-sm font-medium">
                            {row.original.causer.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {row.original.causer.email}
                        </p>
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground">
                        System
                    </span>
                ),
        },
        {
            accessorKey: 'event',
            header: 'Action',
            cell: ({ row }) => (
                <Badge
                    variant={
                        EVENT_COLORS[row.original.event ?? ''] ?? 'secondary'
                    }
                >
                    {row.original.event ?? row.original.description}
                </Badge>
            ),
        },
        {
            accessorKey: 'log_name',
            header: 'Model',
            cell: ({ row }) => (
                <div>
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        {row.original.log_name}
                    </span>
                    {row.original.subject_id && (
                        <span className="ml-1 text-xs text-muted-foreground">
                            #{row.original.subject_id}
                        </span>
                    )}
                </div>
            ),
        },
        {
            id: 'changes',
            header: 'Changes',
            cell: ({ row }) => (
                <ChangeDiff properties={row.original.properties} />
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity Log" />
            <Wrapper>
                <PageHeader
                    title="Activity Log"
                    description="Track who created, modified, or deleted records."
                />

                {/* Filters */}
                <div className="mb-6 grid grid-cols-2 gap-3 rounded-xl border bg-card p-4 md:grid-cols-5">
                    <div className="space-y-1">
                        <Label className="text-xs">User</Label>
                        <Select
                            value={localFilters.causer_id ?? 'all'}
                            onValueChange={(v) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    causer_id: v === 'all' ? undefined : v,
                                }))
                            }
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="All users" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All users</SelectItem>
                                {users.map((u) => (
                                    <SelectItem key={u.id} value={String(u.id)}>
                                        {u.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs">Model</Label>
                        <Select
                            value={localFilters.log_name ?? 'all'}
                            onValueChange={(v) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    log_name: v === 'all' ? undefined : v,
                                }))
                            }
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="All models" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All models</SelectItem>
                                {log_names.map((name) => (
                                    <SelectItem key={name} value={name}>
                                        {name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs">Action</Label>
                        <Select
                            value={localFilters.event ?? 'all'}
                            onValueChange={(v) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    event: v === 'all' ? undefined : v,
                                }))
                            }
                        >
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="All actions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All actions</SelectItem>
                                <SelectItem value="created">Created</SelectItem>
                                <SelectItem value="updated">Updated</SelectItem>
                                <SelectItem value="deleted">Deleted</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs">From</Label>
                        <Input
                            type="date"
                            className="h-8 text-xs"
                            value={localFilters.date_from ?? ''}
                            onChange={(e) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    date_from: e.target.value || undefined,
                                }))
                            }
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs">To</Label>
                        <Input
                            type="date"
                            className="h-8 text-xs"
                            value={localFilters.date_to ?? ''}
                            onChange={(e) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    date_to: e.target.value || undefined,
                                }))
                            }
                        />
                    </div>

                    <div className="col-span-2 flex items-end gap-2 md:col-span-5">
                        <Button size="sm" onClick={applyFilters}>
                            Apply Filters
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={resetFilters}
                        >
                            Reset
                        </Button>
                        <span className="ml-auto text-xs text-muted-foreground">
                            {activities.total} entries
                        </span>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={activities.data}
                    pagination={{
                        current_page: activities.current_page,
                        last_page: activities.last_page,
                        per_page: activities.per_page,
                        total: activities.total,
                        prev_page_url: activities.prev_page_url,
                        next_page_url: activities.next_page_url,
                    }}
                />
            </Wrapper>
        </AppLayout>
    );
}
