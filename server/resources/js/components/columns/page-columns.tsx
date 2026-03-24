import { Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
    CopyIcon,
    FileTextIcon,
    GlobeIcon,
    PencilIcon,
    TrashIcon,
} from 'lucide-react';
import { ConfirmButton } from '@/components/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { resolveLocalizedText } from '@/lib/localized-text';
import type { PageRow } from './page-columns.types';

export function usePageColumns(): ColumnDef<PageRow>[] {
    const __ = useTranslation();

    return [
        {
            accessorKey: 'title',
            header: __('column.title', 'Title'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {row.original.parent_id ? (
                        <span className="ml-4 text-muted-foreground">↳</span>
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                            <FileTextIcon className="h-4 w-4" />
                        </div>
                    )}
                    <div>
                        <span className="font-medium">
                            {resolveLocalizedText(row.original.title)}
                        </span>
                        {row.original.parent && (
                            <p className="text-xs text-muted-foreground">
                                under /
                                {resolveLocalizedText(
                                    row.original.parent.title,
                                )}
                            </p>
                        )}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'slug',
            header: __('column.path', 'Path'),
            cell: ({ row }) => (
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    {row.original.parent
                        ? `/${row.original.parent.slug}/`
                        : '/'}
                    {row.original.slug}
                </code>
            ),
        },
        {
            accessorKey: 'locale',
            header: __('column.site', 'Site'),
            cell: ({ row }) =>
                row.original.locale ? (
                    <Badge variant="outline" className="text-xs font-mono uppercase">
                        {row.original.locale}
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="text-xs">
                        Global
                    </Badge>
                ),
        },
        {
            accessorKey: 'page_type',
            header: __('column.type', 'Type'),
            cell: ({ row }) => (
                <Badge variant="outline" className="text-xs">
                    {row.original.page_type === 'module' &&
                    row.original.module_name
                        ? `Module: ${row.original.module_name}`
                        : row.original.page_type}
                </Badge>
            ),
        },
        {
            accessorKey: 'is_published',
            header: __('column.status', 'Status'),
            cell: ({ row }) =>
                row.original.is_published ? (
                    <Badge variant="default" className="bg-green-600 text-xs">
                        <GlobeIcon className="mr-1 h-3 w-3" />
                        {__('status.published', 'Published')}
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="text-xs">
                        {__('status.draft', 'Draft')}
                    </Badge>
                ),
        },
        {
            id: 'actions',
            header: __('column.actions', 'Actions'),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link
                            href={`/admin/cms/pages/${row.original.id}/edit`}
                            prefetch
                            cacheFor={30}
                        >
                            <PencilIcon className="mr-1 h-3 w-3" />
                            {__('action.edit', 'Edit')}
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            router.post(
                                `/admin/cms/pages/${row.original.id}/duplicate`,
                            )
                        }
                    >
                        <CopyIcon className="mr-1 h-3 w-3" />
                        {__('action.duplicate', 'Duplicate')}
                    </Button>
                    {row.original.is_published ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                router.post(
                                    `/admin/cms/pages/${row.original.id}/unpublish`,
                                )
                            }
                        >
                            {__('action.unpublish', 'Unpublish')}
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                router.post(
                                    `/admin/cms/pages/${row.original.id}/publish`,
                                )
                            }
                        >
                            <GlobeIcon className="mr-1 h-3 w-3" />
                            {__('action.publish', 'Publish')}
                        </Button>
                    )}
                    <ConfirmButton
                        variant="outline"
                        size="sm"
                        title={__('dialog.delete_title', 'Delete Page')}
                        description={`${__('dialog.are_you_sure', 'Are you sure?')} ${__('dialog.cannot_be_undone', 'This action cannot be undone.')}`}
                        onConfirm={() =>
                            router.delete(`/admin/cms/pages/${row.original.id}`)
                        }
                    >
                        <TrashIcon className="mr-1 h-3 w-3" />
                        {__('action.delete', 'Delete')}
                    </ConfirmButton>
                </div>
            ),
        },
    ];
}

/** @deprecated Use usePageColumns() hook instead */
export const pageColumns: ColumnDef<PageRow>[] = [];
