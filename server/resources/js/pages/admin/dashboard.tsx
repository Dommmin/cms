import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Eye,
    EyeOff,
    LayoutDashboard,
    RotateCcw,
    Star,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChartWidget } from '@/components/widgets/chart-widget';
import { CreateWidgetDialog } from '@/components/widgets/create-widget-dialog';
import { StatCard } from '@/components/widgets/stat-card';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes/admin';
import type { BreadcrumbItem } from '@/types';
import type { Widget, WidgetSize } from '@/types/widgets';
import type { DashboardProps } from './dashboard.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-50 text-blue-700',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function Dashboard({
    widgetShells,
    widgets: deferredWidgets,
}: DashboardProps) {
    const __ = useTranslation();
    // Use deferred widgets once loaded; mutations update local state optimistically
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const loaded = deferredWidgets !== undefined;

    useEffect(() => {
        if (deferredWidgets) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setWidgets(deferredWidgets);
        }
    }, [deferredWidgets]);
    const [resetting, setResetting] = useState(false);

    function getSizeClass(size: WidgetSize) {
        switch (size) {
            case 'small':
                return 'col-span-1';
            case 'medium':
                return 'col-span-1 sm:col-span-2';
            case 'large':
                return 'col-span-1 sm:col-span-2 lg:col-span-3';
            case 'full':
                return 'col-span-1 sm:col-span-2 lg:col-span-4';
            default:
                return 'col-span-1';
        }
    }

    function toggleWidget(widgetId: number, currentActive: boolean) {
        router.patch(
            `/admin/dashboard/widgets/${widgetId}`,
            { is_active: !currentActive },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setWidgets((prev) =>
                        prev.map((w) =>
                            w.id === widgetId
                                ? { ...w, is_active: !currentActive }
                                : w,
                        ),
                    );
                },
            },
        );
    }

    function deleteWidget(widgetId: number) {
        router.delete(`/admin/dashboard/widgets/${widgetId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
            },
        });
    }

    function restoreDefaults() {
        setResetting(true);
        router.post(
            '/admin/dashboard/widgets/reset',
            {},
            {
                preserveScroll: true,
                onFinish: () => setResetting(false),
                onSuccess: () => router.reload({ only: ['widgets'] }),
            },
        );
    }

    function renderWidget(widget: Widget) {
        switch (widget.type) {
            case 'stat':
                return (
                    <StatCard
                        title={widget.title}
                        value={widget.data.value}
                        trend={widget.data.trend}
                        icon={widget.icon}
                        color={widget.color}
                        format={widget.data.format}
                    />
                );

            case 'chart':
                return (
                    <ChartWidget
                        title={widget.title}
                        data={widget.data}
                        chartType={widget.config?.chart_type ?? 'line'}
                        color={widget.color ?? 'blue'}
                    />
                );

            case 'table': {
                if (widget.config?.data_source === 'top_products') {
                    return (
                        <Card className="p-6">
                            <h3 className="mb-4 font-semibold">
                                {widget.title}
                            </h3>
                            {widget.data.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {__('empty.no_data', 'No data available.')}
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {widget.data.map(
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        (row: any, index: number) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-lg border p-3"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">
                                                        {row.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {row.total_qty}{' '}
                                                        {__(
                                                            'dashboard.units_sold',
                                                            'units sold',
                                                        )}
                                                    </p>
                                                </div>
                                                <span className="ml-3 shrink-0 text-sm font-semibold">
                                                    $
                                                    {(
                                                        row.total_revenue / 100
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </Card>
                    );
                }

                if (widget.config?.data_source === 'low_stock') {
                    return (
                        <Card className="p-6">
                            <h3 className="mb-4 flex items-center gap-2 font-semibold">
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                {widget.title}
                            </h3>
                            {widget.data.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {__(
                                        'dashboard.all_stocked',
                                        'All variants are well-stocked.',
                                    )}
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {widget.data.map(
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        (row: any) => (
                                            <div
                                                key={row.id}
                                                className="flex items-center justify-between rounded-lg border p-3"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {row.name}
                                                    </p>
                                                    {row.sku && (
                                                        <p className="text-xs text-muted-foreground">
                                                            SKU: {row.sku}
                                                        </p>
                                                    )}
                                                </div>
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                        row.stock <= 2
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                    }`}
                                                >
                                                    {row.stock}{' '}
                                                    {__(
                                                        'dashboard.left',
                                                        'left',
                                                    )}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </Card>
                    );
                }

                if (widget.config?.data_source === 'reviews') {
                    return (
                        <Card className="p-6">
                            <h3 className="mb-4 font-semibold">
                                {widget.title}
                            </h3>
                            {widget.data.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {__('empty.no_reviews', 'No reviews yet.')}
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {widget.data.map(
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        (row: any) => (
                                            <div
                                                key={row.id}
                                                className="rounded-lg border p-3"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium">
                                                            {row.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {row.author} ·{' '}
                                                            {row.created_at}
                                                        </p>
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-0.5">
                                                        {Array.from({
                                                            length: 5,
                                                        }).map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-3 w-3 ${i < row.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                {row.status !== 'approved' && (
                                                    <span className="mt-1 inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
                                                        {row.status}
                                                    </span>
                                                )}
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </Card>
                    );
                }

                return (
                    <Card className="p-6">
                        <h3 className="mb-4 font-semibold">{widget.title}</h3>
                        <div className="space-y-2">
                            {widget.data.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {__('empty.no_data', 'No data available.')}
                                </p>
                            ) : (
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                widget.data.map((row: any, index: number) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                        <div className="flex min-w-0 flex-col">
                                            <span className="truncate text-sm font-medium">
                                                {row.name ||
                                                    row.customer ||
                                                    `#${row.id}`}
                                            </span>
                                            {row.created_at && (
                                                <span className="text-xs text-muted-foreground">
                                                    {row.created_at}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            {row.status && (
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                                                        STATUS_COLORS[
                                                            row.status
                                                        ] ??
                                                        'bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    {row.status}
                                                </span>
                                            )}
                                            {row.total != null && (
                                                <span className="text-sm font-semibold">
                                                    $
                                                    {(row.total / 100).toFixed(
                                                        2,
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                );
            }

            case 'quick_actions':
                return (
                    <Card className="p-6">
                        <h3 className="mb-4 font-semibold">{widget.title}</h3>
                        <div className="grid gap-2">
                            {widget.data.map(
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (action: any, index: number) => (
                                    <Link
                                        key={index}
                                        href={action.url ?? action.route ?? '#'}
                                        className="flex items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-accent"
                                    >
                                        <span className="text-sm">
                                            {action.label}
                                        </span>
                                    </Link>
                                ),
                            )}
                        </div>
                    </Card>
                );

            default:
                return null;
        }
    }

    const displayShells = loaded ? widgets : widgetShells;
    const activeWidgets = widgets.filter((w) => w.is_active);
    const hiddenWidgets = widgets.filter((w) => !w.is_active);
    const activeCount = displayShells.filter((w) => w.is_active).length;
    const hiddenCount = displayShells.filter((w) => !w.is_active).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('page.dashboard', 'Dashboard')} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Toolbar */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>
                            {activeCount}{' '}
                            {__('dashboard.active_widgets', 'active widgets')}
                        </span>
                        {hiddenCount > 0 && (
                            <span className="text-xs">
                                · {hiddenCount}{' '}
                                {__('dashboard.hidden', 'hidden')}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <CreateWidgetDialog
                            onCreated={() =>
                                router.reload({ only: ['widgets'] })
                            }
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={restoreDefaults}
                            disabled={resetting}
                            className="gap-2"
                        >
                            <RotateCcw
                                className={`h-3.5 w-3.5 ${resetting ? 'animate-spin' : ''}`}
                            />
                            {__(
                                'dashboard.restore_defaults',
                                'Restore defaults',
                            )}
                        </Button>
                    </div>
                </div>

                {/* Skeleton while deferred widgets load */}
                {!loaded && (
                    <div className="grid auto-rows-min grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {widgetShells
                            .filter((s) => s.is_active)
                            .map((shell) => (
                                <div
                                    key={shell.id}
                                    className={`${getSizeClass(shell.size)} animate-pulse rounded-xl border border-border bg-muted/40`}
                                    style={{ minHeight: 120 }}
                                />
                            ))}
                    </div>
                )}

                {/* Active widgets grid */}
                {loaded && activeWidgets.length > 0 && (
                    <div className="grid auto-rows-min grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {activeWidgets.map((widget) => (
                            <div
                                key={widget.id}
                                className={`group relative ${getSizeClass(widget.size)}`}
                            >
                                {renderWidget(widget)}
                                {/* Widget controls */}
                                <div className="absolute top-2 right-2 hidden items-center gap-0.5 opacity-0 transition-opacity group-hover:flex group-hover:opacity-100">
                                    <button
                                        onClick={() =>
                                            toggleWidget(widget.id, true)
                                        }
                                        className="rounded-md p-1 text-muted-foreground hover:bg-accent"
                                        title={__('action.hide', 'Hide widget')}
                                    >
                                        <EyeOff className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => deleteWidget(widget.id)}
                                        className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                        title={__(
                                            'action.delete',
                                            'Delete widget',
                                        )}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Hidden widgets */}
                {hiddenWidgets.length > 0 && (
                    <div>
                        <p className="mb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                            {__('dashboard.hidden_widgets', 'Hidden widgets')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {hiddenWidgets.map((widget) => (
                                <div
                                    key={widget.id}
                                    className="group flex items-center gap-0.5 rounded-lg border border-dashed pr-1 hover:border-border"
                                >
                                    <button
                                        onClick={() =>
                                            toggleWidget(widget.id, false)
                                        }
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                                        title={__('action.show', 'Show widget')}
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        {widget.title}
                                    </button>
                                    <button
                                        onClick={() => deleteWidget(widget.id)}
                                        className="rounded-md p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
                                        title={__(
                                            'action.delete',
                                            'Delete widget',
                                        )}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {loaded && widgets.length === 0 && (
                    <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed">
                        <div className="text-center">
                            <LayoutDashboard className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">
                                {__(
                                    'empty.no_widgets',
                                    'No widgets configured.',
                                )}
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {__(
                                    'dashboard.restore_hint',
                                    'Click "Restore defaults" to populate the dashboard.',
                                )}
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4 gap-2"
                                onClick={restoreDefaults}
                                disabled={resetting}
                            >
                                <RotateCcw
                                    className={`h-4 w-4 ${resetting ? 'animate-spin' : ''}`}
                                />
                                {__(
                                    'dashboard.restore_defaults',
                                    'Restore defaults',
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
