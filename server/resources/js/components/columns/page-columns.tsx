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
import { resolveLocalizedText } from '@/lib/localized-text';

export type PageRow = {
    id: number;
    parent_id: number | null;
    title: string | Record<string, string>;
    slug: string;
    page_type: string;
    module_name: string | null;
    is_published: boolean;
    updated_at: string;
};

export const pageColumns: ColumnDef<PageRow>[] = [
    {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    <FileTextIcon className="h-4 w-4" />
                </div>
                <span className="font-medium">{resolveLocalizedText(row.original.title)}</span>
            </div>
        ),
    },
    {
        accessorKey: 'slug',
        header: 'Slug',
        cell: ({ row }) => (
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                {row.original.slug}
            </code>
        ),
    },
    {
        accessorKey: 'page_type',
        header: 'Type',
        cell: ({ row }) => (
            <Badge variant="outline" className="text-xs">
                {row.original.page_type === 'module' && row.original.module_name
                    ? `Module: ${row.original.module_name}`
                    : row.original.page_type}
            </Badge>
        ),
    },
    {
        accessorKey: 'is_published',
        header: 'Status',
        cell: ({ row }) =>
            row.original.is_published ? (
                <Badge variant="default" className="bg-green-600 text-xs">
                    <GlobeIcon className="mr-1 h-3 w-3" />
                    Published
                </Badge>
            ) : (
                <Badge variant="secondary" className="text-xs">
                    Draft
                </Badge>
            ),
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/cms/pages/${row.original.id}/edit`} prefetch cacheFor={30}>
                        <PencilIcon className="mr-1 h-3 w-3" />
                        Edit
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
                    Duplicate
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
                        Unpublish
                    </Button>
                ) : (
                    <Button
                        variant="default"
                        size="sm"
                        onClick={() =>
                            router.post(
                                `/admin/cms/pages/${row.original.id}/publish`,
                            )
                        }
                    >
                        <GlobeIcon className="mr-1 h-3 w-3" />
                        Publish
                    </Button>
                )}
                <ConfirmButton
                    variant="destructive"
                    size="sm"
                    title="Delete Page"
                    description={`Are you sure you want to delete "${resolveLocalizedText(row.original.title)}"? This action cannot be undone.`}
                    onConfirm={() =>
                        router.delete(`/admin/cms/pages/${row.original.id}`)
                    }
                >
                    <TrashIcon className="mr-1 h-3 w-3" />
                    Delete
                </ConfirmButton>
            </div>
        ),
    },
];
