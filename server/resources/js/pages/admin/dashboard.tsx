import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Circle,
    Eye,
    EyeOff,
    LayoutDashboard,
    RotateCcw,
    Sparkles,
    Star,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import * as DashboardWidgetController from '@/actions/App/Http/Controllers/Admin/DashboardWidgetController';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChartWidget } from '@/components/widgets/chart-widget';
import type { DataPoint } from '@/components/widgets/chart-widget.types';
import { CreateWidgetDialog } from '@/components/widgets/create-widget-dialog';
import { StatCard } from '@/components/widgets/stat-card';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes/admin';
import type { BreadcrumbItem } from '@/types';
import type { Widget, WidgetSize } from '@/types/widgets';
import type { DashboardProps, OnboardingStep } from './dashboard.types';

const ONBOARDING_DISMISSED_KEY = 'onboarding_dismissed';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

function OnboardingChecklist({ steps }: { steps: OnboardingStep[] }) {
    const __ = useTranslation();
    const allDone = steps.every((s) => s.done);
    const doneCount = steps.filter((s) => s.done).length;

    const [dismissed, setDismissed] = useState(() => {
        try {
            return localStorage.getItem(ONBOARDING_DISMISSED_KEY) === '1';
        } catch {
            return false;
        }
    });
    const [collapsed, setCollapsed] = useState(false);

    if (dismissed || allDone) {
        return null;
    }

    function dismiss() {
        try {
            localStorage.setItem(ONBOARDING_DISMISSED_KEY, '1');
        } catch {
            // ignore
        }
        setDismissed(true);
    }

    const stepLabels: Record<string, string> = {
        add_product: __('onboarding.add_product', 'Add your first product'),
        create_page: __('onboarding.create_page', 'Create your first page'),
        configure_shipping: __(
            'onboarding.configure_shipping',
            'Configure shipping',
        ),
        connect_payments: __('onboarding.connect_payments', 'Connect payments'),
    };

    const stepDescriptions: Record<string, string> = {
        add_product: __(
            'onboarding.add_product_desc',
            'Add products to your catalog so customers can purchase.',
        ),
        create_page: __(
            'onboarding.create_page_desc',
            'Build your storefront with pages and content blocks.',
        ),
        configure_shipping: __(
            'onboarding.configure_shipping_desc',
            'Set up shipping rates for your store.',
        ),
        connect_payments: __(
            'onboarding.connect_payments_desc',
            'Configure a payment gateway (PayU or Przelewy24).',
        ),
    };

    return (
        <div className="rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <LayoutDashboard className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold">
                            {__('onboarding.title', 'Get started')}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            {doneCount}/{steps.length}{' '}
                            {__('onboarding.steps_done', 'steps complete')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setCollapsed((c) => !c)}
                        className="rounded-md p-1 text-muted-foreground hover:bg-accent"
                        aria-label={
                            collapsed
                                ? __('action.expand', 'Expand')
                                : __('action.collapse', 'Collapse')
                        }
                    >
                        {collapsed ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronUp className="h-4 w-4" />
                        )}
                    </button>
                    <button
                        onClick={dismiss}
                        className="rounded-md p-1 text-muted-foreground hover:bg-accent"
                        aria-label={__('action.dismiss', 'Dismiss')}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {!collapsed && (
                <>
                    <div className="mx-5 mb-2 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                                width: `${(doneCount / steps.length) * 100}%`,
                            }}
                        />
                    </div>
                    <ul className="divide-y px-5 pb-4">
                        {steps.map((step) => (
                            <li key={step.key} className="py-3">
                                <Link
                                    href={step.url}
                                    className={`flex items-start gap-3 ${step.done ? 'pointer-events-none opacity-60' : 'group'}`}
                                >
                                    <span className="mt-0.5 shrink-0">
                                        {step.done ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                        )}
                                    </span>
                                    <span>
                                        <span
                                            className={`block text-sm font-medium ${step.done ? 'line-through' : 'group-hover:text-primary'}`}
                                        >
                                            {stepLabels[step.key] ?? step.key}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {stepDescriptions[step.key] ?? ''}
                                        </span>
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-50 text-blue-700',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

type DashboardTableRow = {
    id?: number;
    name?: string;
    customer?: string;
    created_at?: string;
    status?: string;
    total?: number;
    total_qty?: number;
    total_revenue?: number;
    sku?: string;
    stock?: number;
    author?: string;
    rating?: number;
    [key: string]: unknown;
};

type DashboardQuickAction = {
    label: string;
    url?: string;
    route?: string;
};

export default function Dashboard({
    widgetShells,
    onboarding,
    onboardingWizard,
    widgets: deferredWidgets,
}: DashboardProps) {
    const __ = useTranslation();
    // Use deferred widgets once loaded; mutations update local state optimistically
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const loaded = deferredWidgets !== undefined;

    useEffect(() => {
        if (deferredWidgets) {
            const setWidgetsTimer = setTimeout(
                () => setWidgets(deferredWidgets),
                0,
            );
            return () => clearTimeout(setWidgetsTimer);
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
            DashboardWidgetController.update.url(widgetId),
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
        router.delete(DashboardWidgetController.destroy.url(widgetId), {
            preserveScroll: true,
            onSuccess: () => {
                setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
            },
        });
    }

    function restoreDefaults() {
        setResetting(true);
        router.post(
            DashboardWidgetController.reset.url(),
            {},
            {
                preserveScroll: true,
                onFinish: () => setResetting(false),
                onSuccess: () => router.reload({ only: ['widgets'] }),
            },
        );
    }

    function renderWidget(widget: Widget) {
        const config = (widget.config ?? {}) as Record<string, unknown>;
        const dataRows = Array.isArray(widget.data)
            ? (widget.data as DashboardTableRow[])
            : [];
        const dataObject = !Array.isArray(widget.data)
            ? (widget.data as Record<string, unknown>)
            : {};
        const chartData: DataPoint[] = dataRows
            .map((row) => ({
                date: typeof row.date === 'string' ? row.date : '',
                value:
                    typeof row.value === 'number'
                        ? row.value
                        : Number(row.value ?? 0),
                label: typeof row.label === 'string' ? row.label : undefined,
            }))
            .filter((row) => row.date !== '');

        switch (widget.type) {
            case 'stat':
                return (
                    <StatCard
                        title={widget.title}
                        value={
                            typeof dataObject.value === 'string' ||
                            typeof dataObject.value === 'number'
                                ? dataObject.value
                                : 0
                        }
                        trend={
                            typeof dataObject.trend === 'number'
                                ? dataObject.trend
                                : undefined
                        }
                        icon={widget.icon}
                        color={widget.color}
                        format={
                            dataObject.format === 'number' ||
                            dataObject.format === 'currency'
                                ? dataObject.format
                                : undefined
                        }
                    />
                );

            case 'chart':
                return (
                    <ChartWidget
                        title={widget.title}
                        data={chartData}
                        chartType={
                            (config.chart_type as
                                | 'line'
                                | 'donut'
                                | undefined) ?? 'line'
                        }
                        color={widget.color ?? 'blue'}
                    />
                );

            case 'table': {
                if (config.data_source === 'top_products') {
                    return (
                        <Card className="p-6">
                            <h3 className="mb-4 font-semibold">
                                {widget.title}
                            </h3>
                            {dataRows.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {__('empty.no_data', 'No data available.')}
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {dataRows.map((row, index: number) => (
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
                                                    (row.total_revenue ?? 0) /
                                                    100
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    );
                }

                if (config.data_source === 'low_stock') {
                    return (
                        <Card className="p-6">
                            <h3 className="mb-4 flex items-center gap-2 font-semibold">
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                {widget.title}
                            </h3>
                            {dataRows.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {__(
                                        'dashboard.all_stocked',
                                        'All variants are well-stocked.',
                                    )}
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {dataRows.map((row) => (
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
                                                    (row.stock ?? 0) <= 2
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                }`}
                                            >
                                                {row.stock}{' '}
                                                {__('dashboard.left', 'left')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    );
                }

                if (config.data_source === 'reviews') {
                    return (
                        <Card className="p-6">
                            <h3 className="mb-4 font-semibold">
                                {widget.title}
                            </h3>
                            {dataRows.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {__('empty.no_reviews', 'No reviews yet.')}
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {dataRows.map((row) => (
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
                                                            className={`h-3 w-3 ${i < (row.rating ?? 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
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
                            {dataRows.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {__('empty.no_data', 'No data available.')}
                                </p>
                            ) : (
                                dataRows.map((row, index: number) => (
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
                            {(dataRows as DashboardQuickAction[]).map(
                                (action, index: number) => (
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

                {/* Onboarding Setup Wizard Banner */}
                {!onboardingWizard.is_completed && (
                    <div className="flex flex-col justify-between gap-4 rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent p-5 shadow-sm backdrop-blur-md sm:flex-row sm:items-center dark:border-blue-500/30">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                                <Sparkles className="h-5 w-5 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">
                                    {__(
                                        'onboarding.banner.title',
                                        'Skonfiguruj swój sklep',
                                    )}
                                </h3>
                                <p className="mt-0.5 max-w-2xl text-xs text-muted-foreground">
                                    {__(
                                        'onboarding.banner.desc',
                                        'Użyj naszego kreatora wdrożenia, aby w prosty sposób skonfigurować branding, bramki płatności, metody dostaw, domyślne podatki oraz stronę główną.',
                                    )}
                                </p>
                            </div>
                        </div>
                        <Button
                            asChild
                            size="sm"
                            className="shrink-0 bg-blue-600 text-white hover:bg-blue-700"
                        >
                            <Link href="/panel/onboarding">
                                {__(
                                    'onboarding.banner.button',
                                    'Otwórz Setup Wizard',
                                )}
                                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </div>
                )}

                {/* Onboarding checklist */}
                <OnboardingChecklist steps={onboarding} />

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
