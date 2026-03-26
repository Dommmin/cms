import { Head, router } from '@inertiajs/react';
import { Globe2Icon, LibraryBig, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { GlobalBlock, IndexProps } from './index.types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'CMS', href: '/admin/cms' },
    { title: 'Global Block Library', href: '' },
];

export default function ReusableBlocksIndex({
    blocks,
    available_block_types,
}: IndexProps) {
    const [editBlock, setEditBlock] = useState<GlobalBlock | null>(null);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editActive, setEditActive] = useState(true);
    const [deleteBlock, setDeleteBlock] = useState<GlobalBlock | null>(null);

    const __ = useTranslation();

    const openEdit = (block: GlobalBlock) => {
        setEditBlock(block);
        setEditName(block.name);
        setEditDesc(block.description ?? '');
        setEditActive(block.is_active);
    };

    const handleUpdate = () => {
        if (!editBlock) return;
        router.put(
            `/admin/cms/reusable-blocks/${editBlock.id}`,
            { name: editName, description: editDesc, is_active: editActive },
            {
                onSuccess: () => {
                    toast.success(
                        __('misc.block_updated', 'Global block updated'),
                    );
                    setEditBlock(null);
                },
                onError: () =>
                    toast.error(__('misc.update_failed', 'Update failed')),
            },
        );
    };

    const handleDelete = () => {
        if (!deleteBlock) return;
        router.delete(`/admin/cms/reusable-blocks/${deleteBlock.id}`, {
            onSuccess: () => {
                toast.success(
                    __(
                        'misc.block_deleted',
                        'Global block deleted (pages unlinked)',
                    ),
                );
                setDeleteBlock(null);
            },
            onError: () =>
                toast.error(__('misc.delete_failed', 'Delete failed')),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={__('page.global_block_library', 'Global Block Library')}
            />

            <div className="mx-auto max-w-5xl space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <LibraryBig className="h-6 w-6 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">
                            {__(
                                'page.global_block_library',
                                'Global Block Library',
                            )}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {__(
                                'page.global_block_library_desc',
                                'Blocks that are shared across multiple pages. Editing a block here propagates to all pages that reference it.',
                            )}
                        </p>
                    </div>
                </div>

                {blocks.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-16 text-center">
                        <Globe2Icon className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" />
                        <h3 className="text-lg font-semibold">
                            {__(
                                'empty.no_global_blocks',
                                'No global blocks yet',
                            )}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {__(
                                'empty.no_global_blocks_desc',
                                'Open any Page Builder, create a block, and click the',
                            )}{' '}
                            <strong>
                                {__('misc.save_as_global', 'Save as Global')}
                            </strong>{' '}
                            {__('misc.icon_to_add', 'icon to add it here.')}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {blocks.map((block) => {
                            const typeConfig =
                                available_block_types[block.type];

                            return (
                                <Card
                                    key={block.id}
                                    className={
                                        block.is_active ? '' : 'opacity-60'
                                    }
                                >
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <CardTitle className="text-base">
                                                {block.name}
                                            </CardTitle>
                                            <Badge
                                                variant={
                                                    block.is_active
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                                className="shrink-0 text-xs"
                                            >
                                                {block.is_active
                                                    ? __(
                                                          'status.active',
                                                          'Active',
                                                      )
                                                    : __(
                                                          'status.inactive',
                                                          'Inactive',
                                                      )}
                                            </Badge>
                                        </div>
                                        {block.description && (
                                            <p className="text-xs text-muted-foreground">
                                                {block.description}
                                            </p>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="rounded bg-muted px-1.5 py-0.5 font-mono">
                                                {typeConfig?.name ?? block.type}
                                            </span>
                                            <span>·</span>
                                            <span>
                                                {block.page_blocks_count}{' '}
                                                {block.page_blocks_count === 1
                                                    ? __('misc.page', 'page')
                                                    : __('misc.pages', 'pages')}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => openEdit(block)}
                                            >
                                                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                                {__('action.edit', 'Edit')}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() =>
                                                    setDeleteBlock(block)
                                                }
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Edit dialog */}
            <Dialog
                open={!!editBlock}
                onOpenChange={(o) => !o && setEditBlock(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {__(
                                'dialog.edit_global_block',
                                'Edit Global Block',
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-name">
                                {__('label.name', 'Name')}
                            </Label>
                            <Input
                                id="edit-name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-desc">
                                {__('label.description', 'Description')}
                            </Label>
                            <Input
                                id="edit-desc"
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <p className="text-sm font-medium">
                                    {__('label.active', 'Active')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {__(
                                        'misc.inactive_blocks_hidden',
                                        'Inactive blocks are hidden on all pages',
                                    )}
                                </p>
                            </div>
                            <Switch
                                checked={editActive}
                                onCheckedChange={setEditActive}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditBlock(null)}
                        >
                            {__('action.cancel', 'Cancel')}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleUpdate}
                            disabled={!editName.trim()}
                        >
                            {__('action.save_changes', 'Save Changes')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirm dialog */}
            <Dialog
                open={!!deleteBlock}
                onOpenChange={(o) => !o && setDeleteBlock(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {__(
                                'dialog.delete_global_block',
                                'Delete Global Block?',
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        <strong>"{deleteBlock?.name}"</strong> will be deleted
                        and unlinked from {deleteBlock?.page_blocks_count ?? 0}{' '}
                        page(s). Those blocks will remain but will no longer
                        sync from the library.
                    </p>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteBlock(null)}
                        >
                            {__('action.cancel', 'Cancel')}
                        </Button>
                        <Button variant="outline" onClick={handleDelete}>
                            {__('action.delete', 'Delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
