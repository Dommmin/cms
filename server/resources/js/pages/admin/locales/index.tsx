import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { PlusIcon, StarIcon, TrashIcon, ToggleLeftIcon, ToggleRightIcon } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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

type Locale = {
    id: number;
    code: string;
    name: string;
    native_name: string;
    flag_emoji: string | null;
    currency_code: string | null;
    is_default: boolean;
    is_active: boolean;
};

type CurrencyOption = {
    code: string;
    name: string;
    symbol: string;
};

type LocalesData = {
    data: Locale[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    locales: LocalesData;
    filters: { search?: string };
    currencies: CurrencyOption[];
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Locales', href: '/admin/locales' }];

type LocaleForm = {
    code: string;
    name: string;
    native_name: string;
    flag_emoji: string;
    currency_code: string;
    is_default: boolean;
    is_active: boolean;
};

const defaultForm: LocaleForm = {
    code: '',
    name: '',
    native_name: '',
    flag_emoji: '',
    currency_code: '',
    is_default: false,
    is_active: true,
};

export default function LocalesIndex({ locales, filters, currencies }: Props) {
    const [open, setOpen] = useState(false);
    const [editLocale, setEditLocale] = useState<Locale | null>(null);
    const [form, setForm] = useState<LocaleForm>(defaultForm);
    const [processing, setProcessing] = useState(false);

    const openCreate = () => {
        setEditLocale(null);
        setForm(defaultForm);
        setOpen(true);
    };

    const openEdit = (locale: Locale) => {
        setEditLocale(locale);
        setForm({
            code: locale.code,
            name: locale.name,
            native_name: locale.native_name,
            flag_emoji: locale.flag_emoji ?? '',
            currency_code: locale.currency_code ?? '',
            is_default: locale.is_default,
            is_active: locale.is_active,
        });
        setOpen(true);
    };

    const handleSubmit = () => {
        setProcessing(true);
        const payload = { ...form };
        if (editLocale) {
            router.put(`/admin/locales/${editLocale.id}`, payload, {
                onSuccess: () => { setOpen(false); toast.success('Locale updated'); },
                onError: () => toast.error('Failed to update locale'),
                onFinish: () => setProcessing(false),
            });
        } else {
            router.post('/admin/locales', payload, {
                onSuccess: () => { setOpen(false); toast.success('Locale created'); },
                onError: () => toast.error('Failed to create locale'),
                onFinish: () => setProcessing(false),
            });
        }
    };

    const columns: ColumnDef<Locale>[] = [
        {
            accessorKey: 'code',
            header: 'Code',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className="text-lg">{row.original.flag_emoji ?? ''}</span>
                    <Badge variant="outline" className="font-mono uppercase">
                        {row.original.code}
                    </Badge>
                </div>
            ),
        },
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => (
                <div>
                    <p className="font-medium">{row.original.name}</p>
                    <p className="text-sm text-muted-foreground">{row.original.native_name}</p>
                </div>
            ),
        },
        {
            accessorKey: 'currency_code',
            header: 'Currency',
            cell: ({ row }) =>
                row.original.currency_code ? (
                    <Badge variant="outline" className="font-mono">
                        {row.original.currency_code}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        {
            accessorKey: 'is_default',
            header: 'Default',
            cell: ({ row }) =>
                row.original.is_default ? (
                    <Badge variant="default" className="gap-1">
                        <StarIcon className="h-3 w-3" /> Default
                    </Badge>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            router.post(
                                `/admin/locales/${row.original.id}/set-default`,
                                {},
                                { onSuccess: () => toast.success('Default locale updated') },
                            );
                        }}
                    >
                        Set Default
                    </Button>
                ),
        },
        {
            accessorKey: 'is_active',
            header: 'Active',
            cell: ({ row }) =>
                row.original.is_active ? (
                    <Badge variant="default">Active</Badge>
                ) : (
                    <Badge variant="secondary">Inactive</Badge>
                ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(row.original)}>
                        Edit
                    </Button>
                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        title="Delete Locale"
                        description="This will delete the locale and all its translations. This action cannot be undone."
                        onConfirm={() => {
                            router.delete(`/admin/locales/${row.original.id}`, {
                                onSuccess: () => toast.success('Locale deleted'),
                                onError: () => toast.error('Cannot delete default locale'),
                            });
                        }}
                        disabled={row.original.is_default}
                    >
                        <TrashIcon className="h-3 w-3" />
                        Delete
                    </ConfirmButton>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Locales" />
            <Wrapper>
                <PageHeader title="Locales" description="Manage supported languages">
                    <PageHeaderActions>
                        <Button onClick={openCreate}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Locale
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                <DataTable
                    columns={columns}
                    data={locales.data}
                    pagination={{
                        current_page: locales.current_page,
                        last_page: locales.last_page,
                        per_page: locales.per_page,
                        total: locales.total,
                        prev_page_url: locales.prev_page_url ?? null,
                        next_page_url: locales.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder="Search locales..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/locales"
                />
            </Wrapper>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editLocale ? 'Edit Locale' : 'Add Locale'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Code</Label>
                                <Input
                                    value={form.code}
                                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                                    placeholder="en"
                                    maxLength={10}
                                    disabled={!!editLocale}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>Flag Emoji</Label>
                                <Input
                                    value={form.flag_emoji}
                                    onChange={(e) => setForm((f) => ({ ...f, flag_emoji: e.target.value }))}
                                    placeholder="🇬🇧"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>Name</Label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                placeholder="English"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Native Name</Label>
                            <Input
                                value={form.native_name}
                                onChange={(e) => setForm((f) => ({ ...f, native_name: e.target.value }))}
                                placeholder="English"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Currency</Label>
                            <Select
                                value={form.currency_code || '_none'}
                                onValueChange={(v) => setForm((f) => ({ ...f, currency_code: v === '_none' ? '' : v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select currency..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="_none">— None —</SelectItem>
                                    {currencies.map((c) => (
                                        <SelectItem key={c.code} value={c.code}>
                                            {c.code} — {c.name} ({c.symbol})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-6">
                            <label className="flex cursor-pointer items-center gap-2">
                                {form.is_active ? (
                                    <ToggleRightIcon className="h-5 w-5 text-green-500" />
                                ) : (
                                    <ToggleLeftIcon className="h-5 w-5 text-muted-foreground" />
                                )}
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={form.is_active}
                                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                                />
                                <span className="text-sm">Active</span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-2">
                                {form.is_default ? (
                                    <StarIcon className="h-5 w-5 text-yellow-500" />
                                ) : (
                                    <StarIcon className="h-5 w-5 text-muted-foreground" />
                                )}
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={form.is_default}
                                    onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
                                />
                                <span className="text-sm">Default</span>
                            </label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={processing}>
                            {processing ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
