import { useForm } from '@inertiajs/react';
import * as DashboardWidgetController from '@/actions/App/Http/Controllers/Admin/DashboardWidgetController';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
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
import { useTranslation } from '@/hooks/use-translation';
import type { FormData } from './create-widget-dialog.types';

const COLORS = [
    'blue',
    'green',
    'purple',
    'orange',
    'red',
    'yellow',
    'indigo',
    'gray',
];
const ICONS = [
    'bar-chart',
    'package',
    'shopping-cart',
    'users',
    'dollar-sign',
    'trending-up',
    'star',
    'list',
    'zap',
    'alert-triangle',
    'pie-chart',
];

export function CreateWidgetDialog({ onCreated }: { onCreated?: () => void }) {
    const [open, setOpen] = useState(false);
    const __ = useTranslation();

    const { data, setData, post, processing, errors, reset } =
        useForm<FormData>({
            title: '',
            type: 'stat',
            size: 'small',
            icon: 'bar-chart',
            color: 'blue',
            // stat defaults
            stat_model: 'Order',
            stat_query: 'count',
            stat_field: '',
            stat_format: 'number',
            stat_trend: true,
            stat_period: 'last_month',
            // chart defaults
            chart_type: 'line',
            // table defaults
            table_source: 'top_products',
            table_model: 'Order',
            table_limit: '5',
            table_threshold: '5',
        });

    function close() {
        setOpen(false);
        reset();
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(DashboardWidgetController.store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                close();
                onCreated?.();
            },
        });
    }

    const needsField = data.stat_query === 'sum' || data.stat_query === 'avg';

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setOpen(true)}
            >
                <Plus className="h-3.5 w-3.5" />
                {__('widget.add', 'Add widget')}
            </Button>

            {open && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-50 bg-black/50"
                        onClick={close}
                    />

                    {/* Dialog */}
                    <div className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-6 shadow-xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-base font-semibold">
                                {__('widget.add', 'Add widget')}
                            </h2>
                            <button
                                type="button"
                                onClick={close}
                                className="rounded-md p-1 text-muted-foreground hover:bg-accent"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form
                            onSubmit={submit}
                            noValidate
                            className="space-y-4"
                        >
                            {/* Title */}
                            <div className="space-y-1.5">
                                <Label htmlFor="wg-title">
                                    {__('label.title', 'Title')}
                                </Label>
                                <Input
                                    id="wg-title"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    placeholder={__(
                                        'widget.title_placeholder',
                                        'e.g. Weekly Revenue',
                                    )}
                                />
                                {errors.title && (
                                    <p className="text-xs text-destructive">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            {/* Type + Size row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label>{__('label.type', 'Type')}</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(v) =>
                                            setData('type', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="stat">
                                                {__(
                                                    'widget.type_stat',
                                                    'Statistic',
                                                )}
                                            </SelectItem>
                                            <SelectItem value="chart">
                                                {__(
                                                    'widget.type_chart',
                                                    'Chart',
                                                )}
                                            </SelectItem>
                                            <SelectItem value="table">
                                                {__(
                                                    'widget.type_table',
                                                    'Table',
                                                )}
                                            </SelectItem>
                                            <SelectItem value="quick_actions">
                                                {__(
                                                    'widget.type_quick_actions',
                                                    'Quick Actions',
                                                )}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>{__('label.size', 'Size')}</Label>
                                    <Select
                                        value={data.size}
                                        onValueChange={(v) =>
                                            setData('size', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="small">
                                                {__(
                                                    'widget.size_small',
                                                    'Small (1 col)',
                                                )}
                                            </SelectItem>
                                            <SelectItem value="medium">
                                                {__(
                                                    'widget.size_medium',
                                                    'Medium (2 cols)',
                                                )}
                                            </SelectItem>
                                            <SelectItem value="large">
                                                {__(
                                                    'widget.size_large',
                                                    'Large (3 cols)',
                                                )}
                                            </SelectItem>
                                            <SelectItem value="full">
                                                {__(
                                                    'widget.size_full',
                                                    'Full width',
                                                )}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Icon + Color row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label>{__('label.icon', 'Icon')}</Label>
                                    <Select
                                        value={data.icon}
                                        onValueChange={(v) =>
                                            setData('icon', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ICONS.map((ic) => (
                                                <SelectItem key={ic} value={ic}>
                                                    {ic}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>{__('label.color', 'Color')}</Label>
                                    <Select
                                        value={data.color}
                                        onValueChange={(v) =>
                                            setData('color', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {COLORS.map((c) => (
                                                <SelectItem
                                                    key={c}
                                                    value={c}
                                                    className="capitalize"
                                                >
                                                    {c}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* ── STAT config ─────────────────────────────── */}
                            {data.type === 'stat' && (
                                <div className="space-y-3 rounded-lg border border-border p-3">
                                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        {__(
                                            'widget.stat_config',
                                            'Statistic config',
                                        )}
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label>
                                                {__('label.model', 'Model')}
                                            </Label>
                                            <Select
                                                value={data.stat_model}
                                                onValueChange={(v) =>
                                                    setData('stat_model', v)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Order">
                                                        {__(
                                                            'misc.orders',
                                                            'Orders',
                                                        )}
                                                    </SelectItem>
                                                    <SelectItem value="Product">
                                                        {__(
                                                            'misc.products',
                                                            'Products',
                                                        )}
                                                    </SelectItem>
                                                    <SelectItem value="Customer">
                                                        {__(
                                                            'misc.customers',
                                                            'Customers',
                                                        )}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>
                                                {__(
                                                    'label.aggregation',
                                                    'Aggregation',
                                                )}
                                            </Label>
                                            <Select
                                                value={data.stat_query}
                                                onValueChange={(v) =>
                                                    setData('stat_query', v)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="count">
                                                        {__(
                                                            'widget.agg_count',
                                                            'Count',
                                                        )}
                                                    </SelectItem>
                                                    <SelectItem value="sum">
                                                        {__(
                                                            'widget.agg_sum',
                                                            'Sum',
                                                        )}
                                                    </SelectItem>
                                                    <SelectItem value="avg">
                                                        {__(
                                                            'widget.agg_avg',
                                                            'Average',
                                                        )}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {needsField && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label>
                                                    {__('label.field', 'Field')}
                                                </Label>
                                                <Input
                                                    value={data.stat_field}
                                                    onChange={(e) =>
                                                        setData(
                                                            'stat_field',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={__(
                                                        'widget.field_placeholder',
                                                        'e.g. total',
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>
                                                    {__(
                                                        'label.format',
                                                        'Format',
                                                    )}
                                                </Label>
                                                <Select
                                                    value={data.stat_format}
                                                    onValueChange={(v) =>
                                                        setData(
                                                            'stat_format',
                                                            v,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="number">
                                                            {__(
                                                                'widget.format_number',
                                                                'Number',
                                                            )}
                                                        </SelectItem>
                                                        <SelectItem value="currency">
                                                            {__(
                                                                'widget.format_currency',
                                                                'Currency',
                                                            )}
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <label className="flex cursor-pointer items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={data.stat_trend}
                                                onChange={(e) =>
                                                    setData(
                                                        'stat_trend',
                                                        e.target.checked,
                                                    )
                                                }
                                                className="accent-primary"
                                            />
                                            {__(
                                                'widget.show_trend',
                                                'Show trend vs previous period',
                                            )}
                                        </label>
                                    </div>

                                    {data.stat_trend && (
                                        <div className="space-y-1.5">
                                            <Label>
                                                {__(
                                                    'widget.compare_with',
                                                    'Compare with',
                                                )}
                                            </Label>
                                            <Select
                                                value={data.stat_period}
                                                onValueChange={(v) =>
                                                    setData('stat_period', v)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="last_month">
                                                        {__(
                                                            'widget.period_last_month',
                                                            'Previous month',
                                                        )}
                                                    </SelectItem>
                                                    <SelectItem value="last_week">
                                                        {__(
                                                            'widget.period_last_week',
                                                            'Previous week',
                                                        )}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── CHART config ────────────────────────────── */}
                            {data.type === 'chart' && (
                                <div className="space-y-3 rounded-lg border border-border p-3">
                                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        {__(
                                            'widget.chart_config',
                                            'Chart config',
                                        )}
                                    </p>
                                    <div className="space-y-1.5">
                                        <Label>
                                            {__(
                                                'widget.chart_type',
                                                'Chart type',
                                            )}
                                        </Label>
                                        <Select
                                            value={data.chart_type}
                                            onValueChange={(v) =>
                                                setData('chart_type', v)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="line">
                                                    {__(
                                                        'widget.chart_line',
                                                        'Line — Revenue over time',
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="donut">
                                                    {__(
                                                        'widget.chart_donut',
                                                        'Donut — Orders by status',
                                                    )}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {/* ── TABLE config ────────────────────────────── */}
                            {data.type === 'table' && (
                                <div className="space-y-3 rounded-lg border border-border p-3">
                                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                        {__(
                                            'widget.table_config',
                                            'Table config',
                                        )}
                                    </p>
                                    <div className="space-y-1.5">
                                        <Label>
                                            {__(
                                                'widget.data_source',
                                                'Data source',
                                            )}
                                        </Label>
                                        <Select
                                            value={data.table_source}
                                            onValueChange={(v) =>
                                                setData('table_source', v)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="top_products">
                                                    {__(
                                                        'widget.source_top_products',
                                                        'Top products by revenue',
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="low_stock">
                                                    {__(
                                                        'widget.source_low_stock',
                                                        'Low stock alert',
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="reviews">
                                                    {__(
                                                        'widget.source_reviews',
                                                        'Recent reviews',
                                                    )}
                                                </SelectItem>
                                                <SelectItem value="model">
                                                    {__(
                                                        'widget.source_model',
                                                        'Recent orders / products',
                                                    )}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {data.table_source === 'model' && (
                                        <div className="space-y-1.5">
                                            <Label>
                                                {__('label.model', 'Model')}
                                            </Label>
                                            <Select
                                                value={data.table_model}
                                                onValueChange={(v) =>
                                                    setData('table_model', v)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Order">
                                                        {__(
                                                            'misc.orders',
                                                            'Orders',
                                                        )}
                                                    </SelectItem>
                                                    <SelectItem value="Product">
                                                        {__(
                                                            'misc.products',
                                                            'Products',
                                                        )}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {data.table_source === 'low_stock' ? (
                                        <div className="space-y-1.5">
                                            <Label>
                                                {__(
                                                    'widget.stock_threshold',
                                                    'Stock threshold',
                                                )}
                                            </Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={data.table_threshold}
                                                onChange={(e) =>
                                                    setData(
                                                        'table_threshold',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <Label>
                                                {__(
                                                    'widget.rows_to_show',
                                                    'Rows to show',
                                                )}
                                            </Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={50}
                                                value={data.table_limit}
                                                onChange={(e) =>
                                                    setData(
                                                        'table_limit',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Quick Actions info */}
                            {data.type === 'quick_actions' && (
                                <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                                    {__(
                                        'widget.quick_actions_hint',
                                        'A Quick Actions widget will be created with an empty actions list. Edit actions directly in the database or seeder.',
                                    )}
                                </p>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={close}
                                >
                                    {__('action.cancel', 'Cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={processing}
                                >
                                    {processing
                                        ? __('widget.creating', 'Creating…')
                                        : __('widget.create', 'Create widget')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </>
    );
}
