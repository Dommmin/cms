import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeftIcon } from 'lucide-react';
import * as CustomReportController from '@/actions/App/Http/Controllers/Admin/CustomReportController';
import InputError from '@/components/input-error';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { FormProps, ReportFormData } from './form.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: CustomReportController.index.url() },
    { title: 'Create', href: '' },
];

export default function CreateReport({ dataSources, metrics }: FormProps) {
    const { data, setData, post, processing, errors } =
        useForm<ReportFormData>({
            name: '',
            description: '',
            data_source: dataSources[0]?.key ?? 'orders',
            metrics: [],
            dimensions: [],
            filters: [],
            group_by: [],
            chart_type: 'table',
            is_public: false,
        });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(CustomReportController.store.url());
    };

    const toggleMetric = (key: string) => {
        setData(
            'metrics',
            data.metrics.includes(key)
                ? data.metrics.filter((m) => m !== key)
                : [...data.metrics, key],
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Report" />
            <Wrapper>
                <PageHeader
                    title="Create Report"
                    description="Configure a new custom report"
                >
                    <PageHeaderActions>
                        <Button asChild variant="outline">
                            <Link href={CustomReportController.index.url()}>
                                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <form
                    onSubmit={handleSubmit}
                    className="max-w-2xl space-y-6"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Monthly Revenue"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            placeholder="Optional description"
                            rows={3}
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Data Source *</Label>
                        <Select
                            value={data.data_source}
                            onValueChange={(v) => setData('data_source', v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select data source" />
                            </SelectTrigger>
                            <SelectContent>
                                {dataSources.map((ds) => (
                                    <SelectItem key={ds.key} value={ds.key}>
                                        {ds.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.data_source} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Metrics *</Label>
                        <div className="space-y-2 rounded-md border p-3">
                            {metrics.map((metric) => (
                                <div
                                    key={metric.key}
                                    className="flex items-center gap-2"
                                >
                                    <input
                                        type="checkbox"
                                        id={`metric-${metric.key}`}
                                        checked={data.metrics.includes(
                                            metric.key,
                                        )}
                                        onChange={() =>
                                            toggleMetric(metric.key)
                                        }
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label
                                        htmlFor={`metric-${metric.key}`}
                                        className="cursor-pointer font-normal"
                                    >
                                        {metric.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        <InputError message={errors.metrics} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Chart Type</Label>
                        <Select
                            value={data.chart_type}
                            onValueChange={(v) => setData('chart_type', v)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="table">Table</SelectItem>
                                <SelectItem value="line">Line</SelectItem>
                                <SelectItem value="bar">Bar</SelectItem>
                                <SelectItem value="pie">Pie</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.chart_type} />
                    </div>

                    <div className="flex items-center gap-3">
                        <Switch
                            id="is_public"
                            checked={data.is_public}
                            onCheckedChange={(v) => setData('is_public', v)}
                        />
                        <Label htmlFor="is_public" className="font-normal">
                            Make this report public (visible to all admins)
                        </Label>
                    </div>

                    <Button type="submit" disabled={processing}>
                        {processing ? 'Creating...' : 'Create Report'}
                    </Button>
                </form>
            </Wrapper>
        </AppLayout>
    );
}
