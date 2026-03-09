import { Head, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { CheckIcon, PlusIcon, TrashIcon, XIcon } from 'lucide-react';
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

type LocaleOption = { code: string; name: string; flag_emoji: string | null };

type Translation = {
    id: number;
    locale_code: string;
    group: string;
    key: string;
    value: string;
};

type TranslationsData = {
    data: Translation[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    translations: TranslationsData;
    locales: LocaleOption[];
    groups: string[];
    filters: {
        locale?: string;
        group?: string;
        search?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Translations', href: '/admin/translations' }];
const ALL_GROUPS_VALUE = 'all-groups';

export default function TranslationsIndex({ translations, locales, groups, filters }: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({
        locale_code: filters.locale ?? 'en',
        group: '',
        key: '',
        value: '',
    });
    const [createProcessing, setCreateProcessing] = useState(false);

    const handleFilterChange = (key: string, value: string) => {
        router.get('/admin/translations', { ...filters, [key]: value || undefined, page: undefined }, { preserveState: true, replace: true });
    };

    const handleGroupFilterChange = (value: string) => {
        handleFilterChange('group', value === ALL_GROUPS_VALUE ? '' : value);
    };

    const startEdit = (translation: Translation) => {
        setEditingId(translation.id);
        setEditValue(translation.value);
    };

    const saveEdit = (translation: Translation) => {
        if (editValue === translation.value) {
            setEditingId(null);
            return;
        }
        router.put(
            `/admin/translations/${translation.id}`,
            { value: editValue },
            {
                onSuccess: () => {
                    toast.success('Translation updated');
                    setEditingId(null);
                },
                onError: () => toast.error('Failed to update translation'),
                preserveScroll: true,
            },
        );
    };

    const handleCreate = () => {
        setCreateProcessing(true);
        router.post('/admin/translations', createForm, {
            onSuccess: () => {
                setCreateOpen(false);
                toast.success('Translation created');
                setCreateForm((f) => ({ ...f, group: '', key: '', value: '' }));
            },
            onError: () => toast.error('Failed to create translation'),
            onFinish: () => setCreateProcessing(false),
        });
    };

    const columns: ColumnDef<Translation>[] = [
        {
            accessorKey: 'group',
            header: 'Group',
            cell: ({ row }) => (
                <Badge variant="outline" className="font-mono text-xs">
                    {row.original.group}
                </Badge>
            ),
        },
        {
            accessorKey: 'key',
            header: 'Key',
            cell: ({ row }) => (
                <span className="font-mono text-sm">{row.original.key}</span>
            ),
        },
        {
            accessorKey: 'value',
            header: 'Value',
            cell: ({ row }) => {
                if (editingId === row.original.id) {
                    return (
                        <div className="flex items-center gap-2">
                            <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="h-8 min-w-[200px]"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEdit(row.original);
                                    if (e.key === 'Escape') setEditingId(null);
                                }}
                            />
                            <Button variant="ghost" size="sm" onClick={() => saveEdit(row.original)}>
                                <CheckIcon className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                                <XIcon className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
                    );
                }
                return (
                    <span
                        className="cursor-pointer text-sm hover:underline"
                        onClick={() => startEdit(row.original)}
                    >
                        {row.original.value}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => startEdit(row.original)}>
                        Edit
                    </Button>
                    <ConfirmButton
                        variant="destructive"
                        size="sm"
                        title="Delete Translation"
                        description="Are you sure you want to delete this translation?"
                        onConfirm={() => {
                            router.delete(`/admin/translations/${row.original.id}`, {
                                onSuccess: () => toast.success('Translation deleted'),
                                preserveScroll: true,
                            });
                        }}
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
            <Head title="Translations" />
            <Wrapper>
                <PageHeader title="Translations" description="Manage storefront translations">
                    <PageHeaderActions>
                        <Button onClick={() => setCreateOpen(true)}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Translation
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                {/* Filters */}
                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <Select value={filters.locale ?? 'en'} onValueChange={(v) => handleFilterChange('locale', v)}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Locale" />
                        </SelectTrigger>
                        <SelectContent>
                            {locales.map((l) => (
                                <SelectItem key={l.code} value={l.code}>
                                    {l.flag_emoji} {l.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filters.group ?? ALL_GROUPS_VALUE} onValueChange={handleGroupFilterChange}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="All groups" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL_GROUPS_VALUE}>All groups</SelectItem>
                            {groups.map((g) => (
                                <SelectItem key={g} value={g}>
                                    {g}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <DataTable
                    columns={columns}
                    data={translations.data}
                    pagination={{
                        current_page: translations.current_page,
                        last_page: translations.last_page,
                        per_page: translations.per_page,
                        total: translations.total,
                        prev_page_url: translations.prev_page_url ?? null,
                        next_page_url: translations.next_page_url ?? null,
                    }}
                    searchable
                    searchPlaceholder="Search by key or value..."
                    searchValue={filters.search ?? ''}
                    baseUrl="/admin/translations"
                />
            </Wrapper>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Translation</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1">
                            <Label>Locale</Label>
                            <Select
                                value={createForm.locale_code}
                                onValueChange={(v) => setCreateForm((f) => ({ ...f, locale_code: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {locales.map((l) => (
                                        <SelectItem key={l.code} value={l.code}>
                                            {l.flag_emoji} {l.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Group</Label>
                                <Input
                                    value={createForm.group}
                                    onChange={(e) => setCreateForm((f) => ({ ...f, group: e.target.value }))}
                                    placeholder="nav"
                                    list="groups-list"
                                />
                                <datalist id="groups-list">
                                    {groups.map((g) => <option key={g} value={g} />)}
                                </datalist>
                            </div>
                            <div className="space-y-1">
                                <Label>Key</Label>
                                <Input
                                    value={createForm.key}
                                    onChange={(e) => setCreateForm((f) => ({ ...f, key: e.target.value }))}
                                    placeholder="home"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>Value</Label>
                            <Input
                                value={createForm.value}
                                onChange={(e) => setCreateForm((f) => ({ ...f, value: e.target.value }))}
                                placeholder="Translation text"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={createProcessing}>
                            {createProcessing ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
