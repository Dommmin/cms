import {
    GripVerticalIcon,
    PencilIcon,
    StarIcon,
    TrashIcon,
    XIcon,
} from 'lucide-react';
import { useState } from 'react';
import { ImageEditorModal } from '@/components/image-editor-modal';
import { MediaBrowser } from '@/components/media-browser';
import { getFileIcon } from '@/components/media-browser';
import type { MediaItem } from '@/components/media-browser.types';
import { Button } from '@/components/ui/button';
import type {
    MediaPickerMode,
    MediaPickerModalProps,
    SelectedImage,
} from './media-picker-modal.types';

function selectedFromMediaItem(item: MediaItem): SelectedImage {
    return {
        id: item.id,
        url: item.url,
        name: item.name,
        mime_type: item.mime_type,
        alt: item.alt,
        caption: item.caption,
        file_name: item.file_name,
        size: item.size,
        width: item.width,
        height: item.height,
        thumb_url: item.thumb_url ?? item.thumbnail_url,
        is_thumbnail: false,
    };
}

export function MediaPickerModal({
    open,
    onClose,
    onSelect,
    onConfirm,
    onReorder = () => {},
    onRemove = () => {},
    onSetThumbnail = () => {},
    selectedImages = [],
    selectedItems,
    multiple,
    mode = 'any',
    acceptedMimeTypes = [],
}: MediaPickerModalProps) {
    const [editingImage, setEditingImage] = useState<MediaItem | null>(null);
    const effectiveMultiple = multiple ?? mode === 'gallery';
    const selectedMediaItems = selectedItems ?? selectedImages;
    const selectedIds = selectedMediaItems.map((img) => img.id);

    const handleItemClick = (item: MediaItem) => {
        const isAlreadySelected = selectedMediaItems.some(
            (img) => img.id === item.id,
        );
        if (isAlreadySelected) {
            onRemove(item.id);
        } else {
            onSelect(item);
            if (!effectiveMultiple) {
                onClose();
            }
        }
    };

    const handleUploaded = (items: MediaItem[]) => {
        items.forEach((item) => onSelect(item));
    };

    const handleConfirm = () => {
        onConfirm?.(selectedMediaItems);
        onClose();
    };

    const handleDragStart = (_index: number) => {};

    return (
        <div className={`fixed inset-0 z-50 ${open ? 'block' : 'hidden'}`}>
            <div className="fixed inset-0 bg-black/80" onClick={onClose} />
            <div className="fixed inset-4 flex flex-col overflow-hidden rounded-xl bg-background shadow-2xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h2 className="text-xl font-semibold">
                        {mode === 'gallery'
                            ? 'Select Gallery Images'
                            : mode === 'image'
                              ? 'Select Image'
                              : mode === 'file'
                                ? 'Select File'
                                : mode === 'video'
                                  ? 'Select Video'
                                  : 'Select Media'}
                    </h2>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                    >
                        <XIcon className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <MediaBrowser
                        onItemClick={handleItemClick}
                        selectedIds={selectedIds}
                        mode={mode}
                        acceptedMimeTypes={acceptedMimeTypes}
                        onUploaded={handleUploaded}
                    />

                    {selectedMediaItems.length > 0 && (
                        <div className="flex w-80 flex-col border-l bg-muted/30">
                            <div className="border-b px-4 py-3">
                                <h3 className="font-semibold">
                                    Selected ({selectedMediaItems.length})
                                </h3>
                            </div>
                            <div className="flex-1 space-y-2 overflow-y-auto p-4">
                                {selectedMediaItems.map((image, index) => (
                                    <div
                                        key={image.id}
                                        draggable
                                        onDragStart={() =>
                                            handleDragStart(index)
                                        }
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            onReorder(
                                                [...selectedMediaItems].map(
                                                    (img) => img,
                                                ),
                                            );
                                        }}
                                        onDragEnd={() => {}}
                                        className="flex items-center gap-2 rounded-lg border bg-background p-2"
                                    >
                                        <GripVerticalIcon className="h-4 w-4 cursor-grab text-muted-foreground" />
                                        {(image.mime_type?.startsWith(
                                            'image/',
                                        ) ?? true) ? (
                                            <img
                                                src={image.url}
                                                alt={image.name}
                                                className="h-12 w-12 rounded object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                                                {(() => {
                                                    const Icon = getFileIcon(
                                                        image.mime_type ?? '',
                                                    );
                                                    return (
                                                        <Icon className="h-5 w-5 text-muted-foreground" />
                                                    );
                                                })()}
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm">
                                                {image.name}
                                            </p>
                                            <div className="mt-1 flex gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onSetThumbnail(image.id)
                                                    }
                                                    className={`rounded p-1 ${
                                                        image.is_thumbnail
                                                            ? 'text-yellow-500'
                                                            : 'text-muted-foreground hover:text-yellow-500'
                                                    }`}
                                                    title="Set as thumbnail"
                                                >
                                                    <StarIcon className="h-4 w-4" />
                                                </button>
                                                {image.mime_type?.startsWith(
                                                    'image/',
                                                ) && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setEditingImage(
                                                                image as unknown as MediaItem,
                                                            )
                                                        }
                                                        className="rounded p-1 text-muted-foreground hover:text-primary"
                                                        title="Edit image"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onRemove(image.id)
                                                    }
                                                    className="rounded p-1 text-muted-foreground hover:text-red-500"
                                                    title="Remove"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleConfirm}>
                        {effectiveMultiple ? 'Done' : 'Close'}
                    </Button>
                </div>
            </div>

            {editingImage && (
                <ImageEditorModal
                    open={!!editingImage}
                    onClose={() => setEditingImage(null)}
                    imageUrl={editingImage.url}
                    mediaId={editingImage.id}
                    onCropComplete={(result) => {
                        const croppedItem: MediaItem = {
                            id: result.id,
                            name: result.crop_variant,
                            file_name: result.crop_variant,
                            mime_type: 'image/jpeg',
                            size: 0,
                            url: result.url,
                            width: result.width,
                            height: result.height,
                            crop_of: result.crop_of,
                            crop_params: result.crop_params,
                            crop_variant: result.crop_variant,
                            focal_point: result.focal_point,
                            created_at: new Date().toISOString(),
                        };
                        onSelect(croppedItem);
                        setEditingImage(null);
                    }}
                />
            )}
        </div>
    );
}

export { selectedFromMediaItem };
export type { MediaItem, MediaPickerMode, SelectedImage };
