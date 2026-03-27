import { Head, router } from '@inertiajs/react';
import * as TranslationController from '@/actions/App/Http/Controllers/Admin/TranslationController';
import type { ColumnDef } from '@tanstack/react-table';
import { CheckIcon, RefreshCwIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ConfirmButton } from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Translation, IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Translations', href: TranslationController.index.url() },
];
const ALL_GROUPS_VALUE = 'all-groups';

export default function TranslationsIndex({
    translations,
    locales,
    groups,
    filters,
}: IndexProps) {
    const __ = useTranslation();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');
    const [syncing, setSyncing] = useState(false);

    const handleSync = () => {
        setSyncing(true);
        router.post(
            TranslationController.store.url(),
            {},
            {
                onSuccess: () => toast.success('Translations synced'),
                onError: () => toast.error('Sync failed'),
                onFinish: () => setSyncing(false),
                preserveScroll: true,
            },
        );
    };

    const handleFilterChange = (key: string, value: string | boolean) => {
        router.get(
            TranslationController.index.url(),
            { ...filters, [key]: value || undefined, page: undefined },
            { preserveState: true, replace: true },
        );
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
            TranslationController.update.url(translation.id),
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

    const isMissing = filters.missing === '1' || filters.missing === 'true';

    const columns: ColumnDef<Translation>[] = [
        {
            accessorKey: 'group',
            header: __('column.group', 'Group'),
            cell: ({ row }) => (
                <Badge variant="outline" className="font-mono text-xs">
                    {row.original.group}
                </Badge>
            ),
        },
        {
            accessorKey: 'key',
            header: __('column.key', 'Key'),
            cell: ({ row }) => (
                <span className="font-mono text-sm">{row.original.key}</span>
            ),
        },
        {
            accessorKey: 'value',
            header: __('column.value', 'Value'),
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
                                    if (e.key === 'Enter')
                                        saveEdit(row.original);
                                    if (e.key === 'Escape') setEditingId(null);
                                }}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => saveEdit(row.original)}
                            >
                                <CheckIcon className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingId(null)}
                            >
                                <XIcon className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
                    );
                }
                return (
                    <span
                        className={`cursor-pointer text-sm hover:underline ${!row.original.value ? 'text-muted-foreground italic' : ''}`}
                        onClick={() => startEdit(row.original)}
                    >
                        {row.original.value || '— missing —'}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            header: __('column.actions', 'Actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(row.original)}
                    >
                        {__('action.edit', 'Edit')}
                    </Button>
                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        title={__('dialog.delete_title', 'Delete Translation')}
                        description={`${__('dialog.are_you_sure', 'Are you sure?')} ${__('dialog.cannot_be_undone', 'This action cannot be undone.')}`}
                        onConfirm={() => {
                            router.delete(
                                TranslationController.destroy.url(row.original.id),
                                {
                                    onSuccess: () =>
                                        toast.success('Translation deleted'),
                                    preserveScroll: true,
                                },
                            );
                        }}
                    >
                        {__('action.delete', 'Delete')}
                    </ConfirmButton>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Translations" />
            <Wrapper>
                <PageHeader
                    title={__('page.translations', 'Translations')}
                    description={__(
                        'page.translations_desc',
                        'Translations are discovered automatically from frontend ()) calls.',
                    )}
                >
                    <PageHeaderActions>
                        <Button
                            variant="outline"
                            onClick={handleSync}
                            disabled={syncing}
                        >
                            <RefreshCwIcon
                                className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`}
                            />
                            {syncing
                                ? __('misc.syncing', 'Syncing…')
                                : __(
                                      'misc.sync_from_source',
                                      'Sync from source',
                                  )}
                        </Button>
                    </PageHeaderActions>
                </PageHeader>

                {/* Filters */}
                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <Select
                        value={filters.locale ?? 'en'}
                        onValueChange={(v) => handleFilterChange('locale', v)}
                    >
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

                    <Select
                        value={filters.group ?? ALL_GROUPS_VALUE}
                        onValueChange={handleGroupFilterChange}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="All groups" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL_GROUPS_VALUE}>
                                All groups
                            </SelectItem>
                            {groups.map((g) => (
                                <SelectItem key={g} value={g}>
                                    {g}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        variant={isMissing ? 'default' : 'outline'}
                        size="sm"
                        onClick={() =>
                            handleFilterChange('missing', isMissing ? '' : '1')
                        }
                    >
                        {__('misc.missing_only', 'Missing only')}
                        {isMissing && ' ✓'}
                    </Button>
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
                    searchPlaceholder={__(
                        'placeholder.search_translations',
                        'Search by key or value...',
                    )}
                    searchValue={filters.search ?? ''}
                    baseUrl={TranslationController.index.url()}
                />
            </Wrapper>
        </AppLayout>
    );
}
