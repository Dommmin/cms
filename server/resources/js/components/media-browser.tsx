import axios from 'axios';
import {
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    FileIcon,
    FileTextIcon,
    ImageIcon,
    LayoutGrid,
    List,
    LoaderCircleIcon,
    Search,
    SlidersHorizontal,
    UploadIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as MediaController from '@/actions/App/Http/Controllers/Admin/MediaController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/use-translation';
import type {
    MediaBrowserProps,
    MediaData,
    MediaItem,
    MediaPickerMode,
    ThumbnailSize,
    ViewMode,
} from './media-browser.types';

const IMAGE_MIME_PREFIX = 'image/';
const VIDEO_MIME_PREFIX = 'video/';
const FILE_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-zip-compressed',
];

const MODE_EXTENSIONS: Record<MediaPickerMode, string[]> = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    gallery: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    file: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip'],
    video: ['mp4', 'webm'],
    any: [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'webp',
        'svg',
        'pdf',
        'doc',
        'docx',
        'xls',
        'xlsx',
        'ppt',
        'pptx',
        'zip',
        'mp4',
        'webm',
    ],
};

const MODE_ACCEPTS: Record<MediaPickerMode, string> = {
    image: 'image/*',
    gallery: 'image/*',
    file: FILE_MIME_TYPES.join(','),
    video: 'video/*',
    any: 'image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip,application/x-zip-compressed,video/*',
};

const EMPTY_ACCEPTED_MIME_TYPES: string[] = [];
const MODE_SEARCH_MIME_TYPES: Record<MediaPickerMode, string[]> = {
    image: ['image/*'],
    gallery: ['image/*'],
    file: FILE_MIME_TYPES,
    video: ['video/*'],
    any: [],
};

const THUMBNAIL_SIZES: ThumbnailSize[] = ['small', 'medium', 'large'];
const THUMBNAIL_SIZE_LABELS: Record<ThumbnailSize, string> = {
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
};

const SORT_OPTIONS = [
    { value: 'created_desc', label: 'Newest' },
    { value: 'created_asc', label: 'Oldest' },
    { value: 'name_asc', label: 'Name A-Z' },
    { value: 'name_desc', label: 'Name Z-A' },
    { value: 'size_desc', label: 'Largest' },
    { value: 'size_asc', label: 'Smallest' },
];

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

function gridClassForThumbnailSize(size: ThumbnailSize): string {
    if (size === 'small') {
        return 'grid grid-cols-3 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12';
    }
    if (size === 'large') {
        return 'grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
    }
    return 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
}

function modeAllowsMimeType(
    mimeType: string,
    mode: MediaPickerMode,
    acceptedMimeTypes: string[],
): boolean {
    if (acceptedMimeTypes.length > 0) {
        return acceptedMimeTypes.some((accepted) =>
            accepted.endsWith('/*')
                ? mimeType.startsWith(accepted.replace('/*', '/'))
                : mimeType === accepted,
        );
    }
    if (mode === 'any') return true;
    if (mode === 'image' || mode === 'gallery') {
        return mimeType.startsWith(IMAGE_MIME_PREFIX);
    }
    if (mode === 'video') {
        return mimeType.startsWith(VIDEO_MIME_PREFIX);
    }
    return FILE_MIME_TYPES.includes(mimeType);
}

const MODE_HINTS: Record<MediaPickerMode, string> = {
    image: 'Images only',
    gallery: 'Images only',
    file: 'Documents only',
    video: 'Videos only',
    any: '',
};

function thumbnailSrc(item: MediaItem): string {
    if (item.mime_type === 'image/svg+xml') {
        return item.url;
    }

    return item.thumb_url ?? item.url;
}

export function MediaBrowser({
    onItemClick,
    selectedIds = [],
    mode = 'any',
    acceptedMimeTypes = EMPTY_ACCEPTED_MIME_TYPES,
    onUploaded,
    className,
}: MediaBrowserProps) {
    const __ = useTranslation();
    const [media, setMedia] = useState<MediaData | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [extension, setExtension] = useState('');
    const [sort, setSort] = useState('created_desc');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [thumbnailSize, setThumbnailSize] = useState<ThumbnailSize>('small');
    const [currentPage, setCurrentPage] = useState(1);
    const [uploading, setUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const uploadInputRef = useRef<HTMLInputElement>(null);
    const searchRef = useRef(search);
    const extensionRef = useRef(extension);
    const sortRef = useRef(sort);
    const extensions = MODE_EXTENSIONS[mode];
    const accept =
        acceptedMimeTypes.length > 0
            ? acceptedMimeTypes.join(',')
            : MODE_ACCEPTS[mode];
    const searchMimeTypes = useMemo(
        () =>
            acceptedMimeTypes.length > 0
                ? acceptedMimeTypes
                : MODE_SEARCH_MIME_TYPES[mode],
        [acceptedMimeTypes, mode],
    );

    useEffect(() => {
        searchRef.current = search;
    }, [search]);

    useEffect(() => {
        extensionRef.current = extension;
    }, [extension]);

    useEffect(() => {
        sortRef.current = sort;
    }, [sort]);

    const fetchMedia = useCallback(
        async (page = 1) => {
            setLoading(true);
            const params = new URLSearchParams();
            params.set('page', page.toString());
            if (searchRef.current) params.set('search', searchRef.current);
            if (extensionRef.current)
                params.set('extension', extensionRef.current);
            params.set('sort', sortRef.current);
            searchMimeTypes.forEach((mimeType) => {
                params.append('mime_types[]', mimeType);
            });

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
        },
        [searchMimeTypes],
    );

    useEffect(() => {
        fetchMedia(1);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

    const handleSortChange = (value: string) => {
        setSort(value);
        sortRef.current = value;
        setCurrentPage(1);
        fetchMedia(1);
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
            await fetchMedia(1);
            setCurrentPage(1);
            const filtered = response.data.filter((item) =>
                modeAllowsMimeType(item.mime_type, mode, acceptedMimeTypes),
            );
            if (onUploaded) onUploaded(filtered);
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

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            uploadFiles(e.dataTransfer.files);
        }
    };

    const isSelected = (id: number) => selectedIds.includes(id);

    const visibleMedia = media?.data.filter((item) =>
        modeAllowsMimeType(item.mime_type, mode, acceptedMimeTypes),
    );

    return (
        <div
            className={`flex flex-1 flex-col overflow-hidden ${className ?? ''}`}
        >
            <div className="flex items-center gap-4 border-b px-6 py-3">
                <div className="relative max-w-md flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={__(
                            'placeholder.search_files',
                            'Search files...',
                        )}
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <select
                    value={extension}
                    onChange={(e) => handleExtensionChange(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    aria-label={__('label.filter_type', 'Filter by type')}
                >
                    <option value="">
                        {__('action.all_types', 'All types')}
                    </option>
                    {extensions.map((ext) => (
                        <option key={ext} value={ext}>
                            .{ext}
                        </option>
                    ))}
                </select>
                <select
                    value={sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    aria-label={__('label.sort_by', 'Sort by')}
                >
                    {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {__(`sort.${option.value}`, option.label)}
                        </option>
                    ))}
                </select>
                <div className="flex items-center rounded-md border border-input">
                    <Button
                        type="button"
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="icon"
                        className="h-9 w-9 rounded-r-none"
                        onClick={() => setViewMode('grid')}
                        title={__('action.grid_view', 'Grid view')}
                        aria-label={__('action.grid_view', 'Grid view')}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="icon"
                        className="h-9 w-9 rounded-l-none"
                        onClick={() => setViewMode('list')}
                        title={__('action.list_view', 'List view')}
                        aria-label={__('action.list_view', 'List view')}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
                {viewMode === 'grid' && (
                    <div className="flex items-center gap-2 rounded-md border border-input px-2">
                        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                        <select
                            value={thumbnailSize}
                            onChange={(e) =>
                                setThumbnailSize(
                                    e.target.value as ThumbnailSize,
                                )
                            }
                            className="h-8 bg-background text-sm"
                            aria-label={__(
                                'label.thumbnail_size',
                                'Thumbnail size',
                            )}
                        >
                            {THUMBNAIL_SIZES.map((size) => (
                                <option key={size} value={size}>
                                    {THUMBNAIL_SIZE_LABELS[size]}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <input
                    ref={uploadInputRef}
                    type="file"
                    multiple
                    accept={accept}
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
                        <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <UploadIcon className="mr-2 h-4 w-4" />
                    )}
                    {uploading
                        ? __('action.uploading', 'Uploading...')
                        : __('action.upload', 'Upload')}
                </Button>
                {mode !== 'any' && MODE_HINTS[mode] && (
                    <span className="text-xs text-muted-foreground">
                        {__(`mode.${mode}`, MODE_HINTS[mode])}
                    </span>
                )}
            </div>

            <div
                className="relative flex-1 overflow-y-auto p-6"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {isDragOver && (
                    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10">
                        <UploadIcon className="h-12 w-12 text-primary" />
                        <p className="mt-3 text-lg font-semibold text-primary">
                            {__('misc.drop_files', 'Drop files to upload')}
                        </p>
                    </div>
                )}
                {loading ? (
                    <div
                        className={
                            viewMode === 'grid'
                                ? gridClassForThumbnailSize(thumbnailSize)
                                : 'space-y-2'
                        }
                    >
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className={
                                    viewMode === 'grid'
                                        ? 'aspect-square animate-pulse rounded-lg bg-muted'
                                        : 'h-14 animate-pulse rounded-lg bg-muted'
                                }
                            />
                        ))}
                    </div>
                ) : visibleMedia?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">
                            {__('misc.no_files_found', 'No files found')}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {__(
                                'misc.try_adjusting_search',
                                'Try adjusting your search or upload new files',
                            )}
                        </p>
                    </div>
                ) : (
                    <div
                        className={
                            viewMode === 'grid'
                                ? gridClassForThumbnailSize(thumbnailSize)
                                : 'space-y-2'
                        }
                    >
                        {visibleMedia?.map((item) => {
                            const selected = isSelected(item.id);
                            const Icon = getFileIcon(item.mime_type);
                            return (
                                <button
                                    type="button"
                                    key={item.id}
                                    onClick={() => onItemClick?.(item)}
                                    className={
                                        viewMode === 'grid'
                                            ? `group relative aspect-square overflow-hidden rounded-lg border-2 transition-all hover:ring-2 hover:ring-ring ${selected ? 'border-primary ring-2 ring-primary' : 'border-transparent'}`
                                            : `group flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-all hover:bg-muted ${selected ? 'border-primary ring-2 ring-primary' : 'border-border'}`
                                    }
                                >
                                    {viewMode === 'grid' ? (
                                        <>
                                            {item.mime_type.startsWith(
                                                'image/',
                                            ) ? (
                                                <img
                                                    src={thumbnailSrc(item)}
                                                    alt={item.alt || item.name}
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
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
                                        </>
                                    ) : (
                                        <>
                                            {item.mime_type.startsWith(
                                                'image/',
                                            ) ? (
                                                <img
                                                    src={thumbnailSrc(item)}
                                                    alt={item.alt || item.name}
                                                    className="h-12 w-12 rounded object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <span className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                                                    <Icon className="h-5 w-5 text-muted-foreground" />
                                                </span>
                                            )}
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-medium">
                                                    {item.name}
                                                </span>
                                                <span className="block truncate text-xs text-muted-foreground">
                                                    {item.file_name} ·{' '}
                                                    {item.mime_type}
                                                </span>
                                            </span>
                                            {selected && (
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                                                    <CheckIcon className="h-4 w-4 text-primary-foreground" />
                                                </span>
                                            )}
                                        </>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {media && media.last_page > 1 && (
                <div className="flex items-center justify-between border-t px-6 py-3">
                    <p className="text-sm text-muted-foreground">
                        {__('misc.showing', 'Showing')}{' '}
                        {(media.current_page - 1) * media.per_page + 1}{' '}
                        {__('misc.to', 'to')}{' '}
                        {Math.min(
                            media.current_page * media.per_page,
                            media.total,
                        )}{' '}
                        {__('misc.of', 'of')} {media.total}{' '}
                        {__('misc.files', 'files')}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
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
                            {__('action.previous', 'Previous')}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const newPage = currentPage + 1;
                                setCurrentPage(newPage);
                                fetchMedia(newPage);
                            }}
                            disabled={!media.next_page_url}
                        >
                            {__('action.next', 'Next')}
                            <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export {
    getFileIcon,
    thumbnailSrc,
    modeAllowsMimeType,
    MODE_EXTENSIONS,
    MODE_ACCEPTS,
    MODE_SEARCH_MIME_TYPES,
    EMPTY_ACCEPTED_MIME_TYPES,
    THUMBNAIL_SIZES,
    THUMBNAIL_SIZE_LABELS,
    SORT_OPTIONS,
    MIME_TYPE_ICONS,
    MODE_HINTS,
};
