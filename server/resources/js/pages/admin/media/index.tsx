import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
    EyeIcon,
    SaveIcon,
    TrashIcon,
    XIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as MediaController from '@/actions/App/Http/Controllers/Admin/MediaController';
import { ConfirmButton } from '@/components/confirm-dialog';
import { MediaBrowser } from '@/components/media-browser';
import { getFileIcon, thumbnailSrc } from '@/components/media-browser';
import type { MediaItem } from '@/components/media-browser.types';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { formatFileSize } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Media', href: MediaController.index.url() },
];

type MetaForm = {
    alt: string;
    caption: string;
    description: string;
    author: string;
};

export default function Index() {
    const __ = useTranslation();
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
    const [metaForm, setMetaForm] = useState<MetaForm>({
        alt: '',
        caption: '',
        description: '',
        author: '',
    });
    const [isSavingMeta, setIsSavingMeta] = useState(false);

    useEffect(() => {
        if (selectedItem) {
            setMetaForm({
                alt: selectedItem.alt ?? '',
                caption: selectedItem.caption ?? '',
                description: selectedItem.description ?? '',
                author: selectedItem.credit ?? '',
            });
        }
    }, [selectedItem?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleItemClick = (item: MediaItem) => {
        setSelectedItem(item);
    };

    const handleSaveMeta = () => {
        if (!selectedItem) return;
        setIsSavingMeta(true);

        const form = new FormData();
        form.append('_method', 'PATCH');
        form.append('alt', metaForm.alt);
        form.append('caption', metaForm.caption);
        form.append('description', metaForm.description);
        form.append('author', metaForm.author);

        axios
            .post(MediaController.update.url(selectedItem.id), form)
            .then(() => {
                toast.success(__('misc.media_updated', 'Media updated'));
                setSelectedItem({
                    ...selectedItem,
                    alt: metaForm.alt,
                    caption: metaForm.caption,
                    description: metaForm.description,
                    credit: metaForm.author,
                });
            })
            .catch(() => {
                toast.error(__('misc.failed_save_metadata', 'Failed to save metadata'));
            })
            .finally(() => {
                setIsSavingMeta(false);
            });
    };

    const handleDelete = () => {
        if (!selectedItem) return;

        axios
            .delete(MediaController.destroy.url(selectedItem.id))
            .then(() => {
                toast.success(__('misc.file_deleted', 'File deleted'));
                setSelectedItem(null);
            })
            .catch(() => {
                toast.error(__('misc.delete_failed', 'Delete failed'));
            });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('page.media', 'Media')} />

            <Wrapper>
                <PageHeader
                    title={__('page.media', 'Media Library')}
                    description={__('page.media_desc', 'Manage files and images')}
                />

                <div className="flex flex-1 overflow-hidden">
                    <MediaBrowser
                        onItemClick={handleItemClick}
                        selectedIds={selectedItem ? [selectedItem.id] : []}
                    />

                    {selectedItem && (
                        <div className="w-80 shrink-0 overflow-y-auto border-l bg-muted/30">
                            <div className="flex items-center justify-between border-b px-4 py-3">
                                <h3 className="font-semibold">
                                    {__('misc.details', 'Details')}
                                </h3>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setSelectedItem(null)}
                                >
                                    <XIcon className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="space-y-4 p-4">
                                <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                                    {selectedItem.mime_type.startsWith('image/') ? (
                                        <img
                                            src={thumbnailSrc(selectedItem)}
                                            alt={selectedItem.alt || selectedItem.name}
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            {(() => {
                                                const Icon = getFileIcon(selectedItem.mime_type);
                                                return (
                                                    <Icon className="h-16 w-16 text-muted-foreground" />
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">
                                            {__('label.name', 'Name')}
                                        </Label>
                                        <p className="text-sm font-medium">
                                            {selectedItem.name}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">
                                            {__('label.file_name', 'File name')}
                                        </Label>
                                        <p className="truncate text-sm">
                                            {selectedItem.file_name}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <Label className="text-xs text-muted-foreground">
                                                {__('column.type', 'Type')}
                                            </Label>
                                            <Badge
                                                variant="outline"
                                                className="mt-0.5 block text-xs"
                                            >
                                                {selectedItem.mime_type}
                                            </Badge>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">
                                                {__('column.size', 'Size')}
                                            </Label>
                                            <p className="text-sm">
                                                {formatFileSize(selectedItem.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">
                                            {__('label.uploaded', 'Uploaded')}
                                        </Label>
                                        <p className="text-sm">
                                            {new Date(selectedItem.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {selectedItem.crop_of && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground">
                                                {__('label.crop_variant', 'Crop variant')}
                                            </Label>
                                            <p className="text-sm">
                                                {selectedItem.crop_variant ?? __('misc.free_crop', 'Free crop')}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 border-t pt-3">
                                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        {__('misc.metadata', 'Metadata')}
                                    </p>
                                    {selectedItem.mime_type.startsWith('image/') && (
                                        <>
                                            <div className="space-y-1">
                                                <Label htmlFor="meta-alt" className="text-xs">
                                                    {__('label.alt_text', 'Alt text')}
                                                </Label>
                                                <Input
                                                    id="meta-alt"
                                                    value={metaForm.alt}
                                                    onChange={(e) =>
                                                        setMetaForm((f) => ({
                                                            ...f,
                                                            alt: e.target.value,
                                                        }))
                                                    }
                                                    placeholder={__('placeholder.alt_text', 'Descriptive alt text (SEO + a11y)')}
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="meta-caption" className="text-xs">
                                                    {__('label.caption', 'Caption')}
                                                </Label>
                                                <Input
                                                    id="meta-caption"
                                                    value={metaForm.caption ?? ''}
                                                    onChange={(e) =>
                                                        setMetaForm((f) => ({
                                                            ...f,
                                                            caption: e.target.value,
                                                        }))
                                                    }
                                                    placeholder={__('placeholder.caption', 'Visible caption on page')}
                                                    className="text-sm"
                                                />
                                            </div>
                                        </>
                                    )}
                                    <div className="space-y-1">
                                        <Label htmlFor="meta-description" className="text-xs">
                                            {__('label.description', 'Description')}
                                        </Label>
                                        <Textarea
                                            id="meta-description"
                                            value={metaForm.description ?? ''}
                                            onChange={(e) =>
                                                setMetaForm((f) => ({
                                                    ...f,
                                                    description: e.target.value,
                                                }))
                                            }
                                            placeholder={__('placeholder.internal_description', 'Internal description')}
                                            rows={2}
                                            className="text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="meta-author" className="text-xs">
                                            {__('label.author_copyright', 'Author / Copyright')}
                                        </Label>
                                        <Input
                                            id="meta-author"
                                            value={metaForm.author}
                                            onChange={(e) =>
                                                setMetaForm((f) => ({
                                                    ...f,
                                                    author: e.target.value,
                                                }))
                                            }
                                            placeholder={__('placeholder.photographer_source', 'Photographer / source')}
                                            className="text-sm"
                                        />
                                    </div>
                                    <Button
                                        className="w-full"
                                        size="sm"
                                        onClick={handleSaveMeta}
                                        disabled={isSavingMeta}
                                    >
                                        <SaveIcon className="mr-2 h-3.5 w-3.5" />
                                        {isSavingMeta
                                            ? __('action.saving', 'Saving...')
                                            : __('action.save_metadata', 'Save metadata')}
                                    </Button>
                                </div>

                                <div className="space-y-2 border-t pt-3">
                                    {selectedItem.mime_type.startsWith('image/') && (
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() =>
                                                window.open(selectedItem.url, '_blank')
                                            }
                                        >
                                            <EyeIcon className="mr-2 h-4 w-4" />
                                            {__('action.view_full_size', 'View Full Size')}
                                        </Button>
                                    )}
                                    <ConfirmButton
                                        variant="outline"
                                        className="w-full"
                                        title={__('dialog.delete_file', 'Delete File')}
                                        description={`${__('dialog.delete_confirm', 'Are you sure you want to delete')} "${selectedItem.name}"? ${__('dialog.cannot_undo', 'This action cannot be undone.')}`}
                                        onConfirm={handleDelete}
                                    >
                                        <TrashIcon className="mr-2 h-4 w-4" />
                                        {__('action.delete', 'Delete')}
                                    </ConfirmButton>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Wrapper>
        </AppLayout>
    );
}