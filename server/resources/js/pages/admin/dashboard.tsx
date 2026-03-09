import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, Eye, EyeOff, LayoutDashboard, RotateCcw, Star } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChartWidget } from '@/components/widgets/chart-widget';
import { StatCard } from '@/components/widgets/stat-card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes/admin';
import type { BreadcrumbItem } from '@/types';
import type { Widget, WidgetSize } from '@/types/widgets';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

interface DashboardProps {
    widgets: Widget[];
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-50 text-blue-700',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function Dashboard({ widgets: initialWidgets }: DashboardProps) {
    const [widgets, setWidgets] = useState(initialWidgets);
    const [resetting, setResetting] = useState(false);

    function getSizeClass(size: WidgetSize) {
        switch (size) {
            case 'small':
                return 'md:col-span-1';
            case 'medium':
                return 'md:col-span-2';
            case 'large':
                return 'md:col-span-3';
            case 'full':
                return 'md:col-span-4';
            default:
                return 'md:col-span-1';
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
                            w.id === widgetId ? { ...w, is_active: !currentActive } : w,
                        ),
                    );
                },
            },
        );
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
                            <h3 className="mb-4 font-semibold">{widget.title}</h3>
                            {widget.data.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No sales data yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {widget.data.map((row: any, index: number) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{row.name}</p>
                                                <p className="text-xs text-muted-foreground">{row.total_qty} units sold</p>
                                            </div>
                                            <span className="ml-3 shrink-0 text-sm font-semibold">
                                                ${(row.total_revenue / 100).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
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
                                <p className="text-sm text-muted-foreground">All variants are well-stocked.</p>
                            ) : (
                                <div className="space-y-2">
                                    {widget.data.map((row: any) => (
                                        <div
                                            key={row.id}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">{row.name}</p>
                                                {row.sku && <p className="text-xs text-muted-foreground">SKU: {row.sku}</p>}
                                            </div>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                    row.stock <= 2
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                }`}
                                            >
                                                {row.stock} left
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    );
                }

                if (widget.config?.data_source === 'reviews') {
                    return (
                        <Card className="p-6">
                            <h3 className="mb-4 font-semibold">{widget.title}</h3>
                            {widget.data.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No reviews yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {widget.data.map((row: any) => (
                                        <div key={row.id} className="rounded-lg border p-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium">{row.name}</p>
                                                    <p className="text-xs text-muted-foreground">{row.author} · {row.created_at}</p>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-0.5">
                                                    {Array.from({ length: 5 }).map((_, i) => (
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
                                    ))}
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
                                <p className="text-sm text-muted-foreground">No data available</p>
                            ) : (
                                widget.data.map((row: any, index: number) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                        <div className="flex min-w-0 flex-col">
                                            <span className="truncate text-sm font-medium">
                                                {row.name || row.customer || `#${row.id}`}
                                            </span>
                                            {row.created_at && (
                                                <span className="text-xs text-muted-foreground">{row.created_at}</span>
                                            )}
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            {row.status && (
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                                                        STATUS_COLORS[row.status] ?? 'bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    {row.status}
                                                </span>
                                            )}
                                            {row.total != null && (
                                                <span className="text-sm font-semibold">${(row.total / 100).toFixed(2)}</span>
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
                            {widget.data.map((action: any, index: number) => (
                                <Link
                                    key={index}
                                    href={action.url ?? action.route ?? '#'}
                                    className="flex items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-accent"
                                >
                                    <span className="text-sm">{action.label}</span>
                                </Link>
                            ))}
                        </div>
                    </Card>
                );

            default:
                return null;
        }
    }

    const activeWidgets = widgets.filter((w) => w.is_active);
    const hiddenWidgets = widgets.filter((w) => !w.is_active);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

                {/* Toolbar */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>{activeWidgets.length} active widget{activeWidgets.length !== 1 ? 's' : ''}</span>
                        {hiddenWidgets.length > 0 && (
                            <span className="text-xs">· {hiddenWidgets.length} hidden</span>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={restoreDefaults}
                        disabled={resetting}
                        className="gap-2"
                    >
                        <RotateCcw className={`h-3.5 w-3.5 ${resetting ? 'animate-spin' : ''}`} />
                        Restore defaults
                    </Button>
                </div>

                {/* Active widgets grid */}
                {activeWidgets.length > 0 && (
                    <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                        {activeWidgets.map((widget) => (
                            <div key={widget.id} className={`group relative ${getSizeClass(widget.size)}`}>
                                {renderWidget(widget)}
                                {/* Hide toggle */}
                                <button
                                    onClick={() => toggleWidget(widget.id, true)}
                                    className="absolute right-2 top-2 hidden rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100 group-hover:flex"
                                    title="Hide widget"
                                >
                                    <EyeOff className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Hidden widgets */}
                {hiddenWidgets.length > 0 && (
                    <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Hidden widgets
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {hiddenWidgets.map((widget) => (
                                <button
                                    key={widget.id}
                                    onClick={() => toggleWidget(widget.id, false)}
                                    className="flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-1.5 text-sm text-muted-foreground hover:border-border hover:text-foreground"
                                    title="Show widget"
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                    {widget.title}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {widgets.length === 0 && (
                    <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed">
                        <div className="text-center">
                            <LayoutDashboard className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                            <h3 className="text-lg font-semibold">No widgets configured</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Click "Restore defaults" to populate the dashboard.
                            </p>
                            <Button className="mt-4 gap-2" onClick={restoreDefaults} disabled={resetting}>
                                <RotateCcw className={`h-4 w-4 ${resetting ? 'animate-spin' : ''}`} />
                                Restore defaults
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
