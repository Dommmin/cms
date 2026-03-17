import { useForm } from '@inertiajs/react';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface FormData {
    title: string;
    type: string;
    size: string;
    icon: string;
    color: string;
    // stat
    stat_model: string;
    stat_query: string;
    stat_field: string;
    stat_format: string;
    stat_trend: boolean;
    stat_period: string;
    // chart
    chart_type: string;
    // table
    table_source: string;
    table_model: string;
    table_limit: string;
    table_threshold: string;
    [key: string]: string | boolean;
}

const COLORS = ['blue', 'green', 'purple', 'orange', 'red', 'yellow', 'indigo', 'gray'];
const ICONS = ['bar-chart', 'package', 'shopping-cart', 'users', 'dollar-sign', 'trending-up', 'star', 'list', 'zap', 'alert-triangle', 'pie-chart'];

export function CreateWidgetDialog({ onCreated }: { onCreated?: () => void }) {
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
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
        post('/admin/dashboard/widgets', {
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
            <Button size="sm" className="gap-2" onClick={() => setOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                Add widget
            </Button>

            {open && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-50 bg-black/50" onClick={close} />

                    {/* Dialog */}
                    <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-6 shadow-xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-base font-semibold">Add widget</h2>
                            <button
                                type="button"
                                onClick={close}
                                className="rounded-md p-1 text-muted-foreground hover:bg-accent"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={submit} noValidate className="space-y-4">
                            {/* Title */}
                            <div className="space-y-1.5">
                                <Label htmlFor="wg-title">Title</Label>
                                <Input
                                    id="wg-title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g. Weekly Revenue"
                                />
                                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                            </div>

                            {/* Type + Size row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label>Type</Label>
                                    <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="stat">Statistic</SelectItem>
                                            <SelectItem value="chart">Chart</SelectItem>
                                            <SelectItem value="table">Table</SelectItem>
                                            <SelectItem value="quick_actions">Quick Actions</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Size</Label>
                                    <Select value={data.size} onValueChange={(v) => setData('size', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="small">Small (1 col)</SelectItem>
                                            <SelectItem value="medium">Medium (2 cols)</SelectItem>
                                            <SelectItem value="large">Large (3 cols)</SelectItem>
                                            <SelectItem value="full">Full width</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Icon + Color row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label>Icon</Label>
                                    <Select value={data.icon} onValueChange={(v) => setData('icon', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {ICONS.map((ic) => (
                                                <SelectItem key={ic} value={ic}>{ic}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Color</Label>
                                    <Select value={data.color} onValueChange={(v) => setData('color', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {COLORS.map((c) => (
                                                <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* ── STAT config ─────────────────────────────── */}
                            {data.type === 'stat' && (
                                <div className="space-y-3 rounded-lg border border-border p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Statistic config</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label>Model</Label>
                                            <Select value={data.stat_model} onValueChange={(v) => setData('stat_model', v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Order">Orders</SelectItem>
                                                    <SelectItem value="Product">Products</SelectItem>
                                                    <SelectItem value="Customer">Customers</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Aggregation</Label>
                                            <Select value={data.stat_query} onValueChange={(v) => setData('stat_query', v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="count">Count</SelectItem>
                                                    <SelectItem value="sum">Sum</SelectItem>
                                                    <SelectItem value="avg">Average</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {needsField && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label>Field</Label>
                                                <Input
                                                    value={data.stat_field}
                                                    onChange={(e) => setData('stat_field', e.target.value)}
                                                    placeholder="e.g. total"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Format</Label>
                                                <Select value={data.stat_format} onValueChange={(v) => setData('stat_format', v)}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="number">Number</SelectItem>
                                                        <SelectItem value="currency">Currency</SelectItem>
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
                                                onChange={(e) => setData('stat_trend', e.target.checked)}
                                                className="accent-primary"
                                            />
                                            Show trend vs previous period
                                        </label>
                                    </div>

                                    {data.stat_trend && (
                                        <div className="space-y-1.5">
                                            <Label>Compare with</Label>
                                            <Select value={data.stat_period} onValueChange={(v) => setData('stat_period', v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="last_month">Previous month</SelectItem>
                                                    <SelectItem value="last_week">Previous week</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── CHART config ────────────────────────────── */}
                            {data.type === 'chart' && (
                                <div className="space-y-3 rounded-lg border border-border p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Chart config</p>
                                    <div className="space-y-1.5">
                                        <Label>Chart type</Label>
                                        <Select value={data.chart_type} onValueChange={(v) => setData('chart_type', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="line">Line — Revenue over time</SelectItem>
                                                <SelectItem value="donut">Donut — Orders by status</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {/* ── TABLE config ────────────────────────────── */}
                            {data.type === 'table' && (
                                <div className="space-y-3 rounded-lg border border-border p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Table config</p>
                                    <div className="space-y-1.5">
                                        <Label>Data source</Label>
                                        <Select value={data.table_source} onValueChange={(v) => setData('table_source', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="top_products">Top products by revenue</SelectItem>
                                                <SelectItem value="low_stock">Low stock alert</SelectItem>
                                                <SelectItem value="reviews">Recent reviews</SelectItem>
                                                <SelectItem value="model">Recent orders / products</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {data.table_source === 'model' && (
                                        <div className="space-y-1.5">
                                            <Label>Model</Label>
                                            <Select value={data.table_model} onValueChange={(v) => setData('table_model', v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Order">Orders</SelectItem>
                                                    <SelectItem value="Product">Products</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {data.table_source === 'low_stock' ? (
                                        <div className="space-y-1.5">
                                            <Label>Stock threshold</Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={data.table_threshold}
                                                onChange={(e) => setData('table_threshold', e.target.value)}
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <Label>Rows to show</Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={50}
                                                value={data.table_limit}
                                                onChange={(e) => setData('table_limit', e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Quick Actions info */}
                            {data.type === 'quick_actions' && (
                                <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                                    A Quick Actions widget will be created with an empty actions list. Edit actions directly in the database or seeder.
                                </p>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-2 pt-1">
                                <Button type="button" variant="outline" size="sm" onClick={close}>
                                    Cancel
                                </Button>
                                <Button type="submit" size="sm" disabled={processing}>
                                    {processing ? 'Creating…' : 'Create widget'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </>
    );
}
