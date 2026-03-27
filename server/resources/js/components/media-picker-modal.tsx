import axios from 'axios';
import {
    XIcon,
    Search,
    ImageIcon,
    FileIcon,
    FileTextIcon,
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    GripVerticalIcon,
    StarIcon,
    TrashIcon,
    UploadIcon,
    LoaderCircleIcon,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as MediaController from '@/actions/App/Http/Controllers/Admin/MediaController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type {
    MediaItem,
    SelectedImage,
    MediaData,
    MediaPickerModalProps,
} from './media-picker-modal.types';

const MIME_TYPE_ICONS: Record<string, React.ElementType> = {
    'image/': ImageIcon,
    'application/pdf': FileTextIcon,
};

function getFileIcon(mimeType: string) {
    for (const [prefix, Icon] of Object.entries(MIME_TYPE_ICONS)) {
        if (mimeType.startsWith(prefix)) {
            return Icon;
        }
    }
    return FileIcon;
}

export function MediaPickerModal({
    open,
    onClose,
    onSelect,
    onReorder,
    onRemove,
    onSetThumbnail,
    selectedImages = [],
    multiple: _multiple = false,
}: MediaPickerModalProps) {
    const [media, setMedia] = useState<MediaData | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [extension, setExtension] = useState('');
    const [_selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const uploadInputRef = useRef<HTMLInputElement>(null);
    const searchRef = useRef(search);
    const extensionRef = useRef(extension);

    useEffect(() => {
        searchRef.current = search;
    }, [search]);

    useEffect(() => {
        extensionRef.current = extension;
    }, [extension]);

    const fetchMedia = useCallback(async (page = 1) => {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('page', page.toString());
        if (searchRef.current) params.set('search', searchRef.current);
        if (extensionRef.current) params.set('extension', extensionRef.current);

        try {
            const response = await axios.get(
                `${MediaController.search.url()}?${params.toString()}`,
            );
            setMedia(response.data);
        } catch (error) {
            console.error('Failed to fetch media:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!open) return;

        setCurrentPage(1);
        fetchMedia(1);
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearchChange = (value: string) => {
        setSearch(value);
        const timeoutId = setTimeout(() => {
            setCurrentPage(1);
            fetchMedia(1);
        }, 300);
        return () => clearTimeout(timeoutId);
    };

    const handleExtensionChange = (value: string) => {
        setExtension(value);
        setCurrentPage(1);
        fetchMedia(1);
    };

    const handleMediaSelect = (item: MediaItem) => {
        const isAlreadySelected = selectedImages.some(
            (img) => img.id === item.id,
        );
        if (isAlreadySelected) {
            onRemove(item.id);
        } else {
            onSelect(item);
        }
    };

    const handleConfirm = () => {
        onClose();
    };

    const _handleItemClick = (item: MediaItem) => {
        setSelectedItem(item);
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newImages = [...selectedImages];
        const draggedImage = newImages[draggedIndex];
        newImages.splice(draggedIndex, 1);
        newImages.splice(index, 0, draggedImage);

        setDraggedIndex(index);
        onReorder(newImages);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const uploadFiles = async (files: FileList | File[]) => {
        if (!files || files.length === 0) return;
        setUploading(true);

        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append('files[]', file));

        try {
            const response = await axios.post<MediaItem[]>(
                MediaController.upload.url(),
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } },
            );
            // Refresh the list to show newly uploaded files
            await fetchMedia(1);
            setCurrentPage(1);
            // Auto-select all newly uploaded items
            response.data.forEach((item) => onSelect(item));
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleUploadInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (e.target.files) {
            uploadFiles(e.target.files);
            e.target.value = '';
        }
    };

    const handleDropzoneDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDropzoneDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDropzoneDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            uploadFiles(e.dataTransfer.files);
        }
    };

    const extensions = [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'webp',
        'svg',
        'pdf',
        'mp4',
        'webm',
    ];

    const isSelected = (id: number) =>
        selectedImages.some((img) => img.id === id);

    return (
        <div className={`fixed inset-0 z-50 ${open ? 'block' : 'hidden'}`}>
            <div className="fixed inset-0 bg-black/80" onClick={onClose} />
            <div className="fixed inset-4 flex flex-col overflow-hidden rounded-xl bg-background shadow-2xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h2 className="text-xl font-semibold">Select Media</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <XIcon className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <div className="flex flex-1 flex-col overflow-hidden">
                        <div className="flex items-center gap-4 border-b px-6 py-3">
                            <div className="relative max-w-md flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search files..."
                                    value={search}
                                    onChange={(e) => {
                                        handleSearchChange(e.target.value);
                                    }}
                                    className="pl-9"
                                />
                            </div>
                            <select
                                value={extension}
                                onChange={(e) => {
                                    handleExtensionChange(e.target.value);
                                }}
                                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">All types</option>
                                {extensions.map((ext) => (
                                    <option key={ext} value={ext}>
                                        .{ext}
                                    </option>
                                ))}
                            </select>
                            <input
                                ref={uploadInputRef}
                                type="file"
                                multiple
                                accept="image/*,application/pdf,video/*"
                                className="hidden"
                                onChange={handleUploadInputChange}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => uploadInputRef.current?.click()}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                                ) : (
                                    <UploadIcon className="h-4 w-4" />
                                )}
                                {uploading ? 'Uploading...' : 'Upload'}
                            </Button>
                        </div>

                        <div
                            className="relative flex-1 overflow-y-auto p-6"
                            onDragOver={handleDropzoneDragOver}
                            onDragLeave={handleDropzoneDragLeave}
                            onDrop={handleDropzoneDrop}
                        >
                            {isDragOver && (
                                <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10">
                                    <UploadIcon className="h-12 w-12 text-primary" />
                                    <p className="mt-3 text-lg font-semibold text-primary">
                                        Drop files to upload
                                    </p>
                                </div>
                            )}
                            {loading ? (
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                    {[...Array(12)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="aspect-square animate-pulse rounded-lg bg-muted"
                                        />
                                    ))}
                                </div>
                            ) : media?.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">
                                        No files found
                                    </h3>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Try adjusting your search or upload new
                                        files
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                    {media?.data.map((item) => {
                                        const selected = isSelected(item.id);
                                        const Icon = getFileIcon(
                                            item.mime_type,
                                        );
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() =>
                                                    handleMediaSelect(item)
                                                }
                                                className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all hover:ring-2 hover:ring-ring ${
                                                    selected
                                                        ? 'border-primary ring-2 ring-primary'
                                                        : 'border-transparent'
                                                }`}
                                            >
                                                {item.mime_type.startsWith(
                                                    'image/',
                                                ) ? (
                                                    <img
                                                        src={item.url}
                                                        alt={item.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-muted">
                                                        <Icon className="h-12 w-12 text-muted-foreground" />
                                                    </div>
                                                )}
                                                {selected && (
                                                    <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                                                        <CheckIcon className="h-4 w-4 text-primary-foreground" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <p className="truncate text-xs text-white">
                                                        {item.name}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {media && media.last_page > 1 && (
                            <div className="flex items-center justify-between border-t px-6 py-3">
                                <p className="text-sm text-muted-foreground">
                                    Showing{' '}
                                    {(media.current_page - 1) * media.per_page +
                                        1}{' '}
                                    to{' '}
                                    {Math.min(
                                        media.current_page * media.per_page,
                                        media.total,
                                    )}{' '}
                                    of {media.total} files
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const newPage = currentPage - 1;
                                            setCurrentPage(newPage);
                                            fetchMedia(newPage);
                                        }}
                                        disabled={!media.prev_page_url}
                                    >
                                        <ChevronLeftIcon className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const newPage = currentPage + 1;
                                            setCurrentPage(newPage);
                                            fetchMedia(newPage);
                                        }}
                                        disabled={!media.next_page_url}
                                    >
                                        Next
                                        <ChevronRightIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {selectedImages.length > 0 && (
                        <div className="flex w-80 flex-col border-l bg-muted/30">
                            <div className="border-b px-4 py-3">
                                <h3 className="font-semibold">
                                    Selected ({selectedImages.length})
                                </h3>
                            </div>
                            <div className="flex-1 space-y-2 overflow-y-auto p-4">
                                {selectedImages.map((image, index) => (
                                    <div
                                        key={image.id}
                                        draggable
                                        onDragStart={() =>
                                            handleDragStart(index)
                                        }
                                        onDragOver={(e) =>
                                            handleDragOver(e, index)
                                        }
                                        onDragEnd={handleDragEnd}
                                        className={`flex items-center gap-2 rounded-lg border bg-background p-2 ${
                                            draggedIndex === index
                                                ? 'opacity-50'
                                                : ''
                                        }`}
                                    >
                                        <GripVerticalIcon className="h-4 w-4 cursor-grab text-muted-foreground" />
                                        <img
                                            src={image.url}
                                            alt={image.name}
                                            className="h-12 w-12 rounded object-cover"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm">
                                                {image.name}
                                            </p>
                                            <div className="mt-1 flex gap-1">
                                                <button
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
                                                <button
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
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm}>Done</Button>
                </div>
            </div>
        </div>
    );
}

export type { MediaItem, SelectedImage };
