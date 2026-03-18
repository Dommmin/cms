import { Head, router } from '@inertiajs/react';
import {
    EyeIcon,
    TrashIcon,
    UploadIcon,
    ImageIcon,
    FileIcon,
    FileTextIcon,
    Search,
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    XIcon,
    SaveIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ConfirmButton } from '@/components/confirm-dialog';
import { PageHeader, PageHeaderActions } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dropzone, FilePreview } from '@/components/ui/dropzone';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type MediaCustomProperties = {
    alt?: string;
    caption?: string;
    description?: string;
    author?: string;
};

type MediaItem = {
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    size: number;
    url: string;
    thumbnail_url: string | null;
    custom_properties: MediaCustomProperties | null;
    created_at: string;
};

type MediaData = {
    data: MediaItem[];
    prev_page_url: string | null;
    next_page_url: string | null;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

type MetaForm = {
    alt: string;
    caption: string;
    description: string;
    author: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Media', href: '/admin/media' },
];

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(mimeType: string) {
    if (mimeType.startsWith('image/')) return ImageIcon;
    if (mimeType === 'application/pdf') return FileTextIcon;
    return FileIcon;
}

export default function Index({
    media,
    filters,
}: {
    media: MediaData;
    filters: { search?: string; extension?: string };
}) {
    const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const [extension, setExtension] = useState(filters.extension ?? '');
    const [currentPage, setCurrentPage] = useState(media.current_page);
    const [metaForm, setMetaForm] = useState<MetaForm>({
        alt: '',
        caption: '',
        description: '',
        author: '',
    });
    const [isSavingMeta, setIsSavingMeta] = useState(false);

    // Sync metadata form when a new item is selected
    useEffect(() => {
        if (selectedItem) {
            setMetaForm({
                alt: selectedItem.custom_properties?.alt ?? '',
                caption: selectedItem.custom_properties?.caption ?? '',
                description: selectedItem.custom_properties?.description ?? '',
                author: selectedItem.custom_properties?.author ?? '',
            });
        }
    }, [selectedItem?.id]);

    const handleSearch = (value: string) => {
        setSearch(value);
        const params = new URLSearchParams();
        if (value) params.set('search', value);
        if (extension) params.set('extension', extension);
        router.get(`/admin/media?${params.toString()}`, undefined, {
            preserveState: true,
        });
    };

    const handleExtensionFilter = (value: string) => {
        setExtension(value);
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (value) params.set('extension', value);
        router.get(`/admin/media?${params.toString()}`, undefined, {
            preserveState: true,
        });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        const params = new URLSearchParams();
        params.set('page', page.toString());
        if (search) params.set('search', search);
        if (extension) params.set('extension', extension);
        router.get(`/admin/media?${params.toString()}`, undefined, {
            preserveState: true,
        });
    };

    const handleDropzoneUpload = async (files: File[]) => {
        setUploadingFiles(files);
        setIsUploading(true);

        const formData = new FormData();
        files.forEach((file) => formData.append('files[]', file));

        router.post('/admin/media', formData, {
            onSuccess: () => {
                toast.success(`${files.length} file(s) uploaded`);
                setUploadingFiles([]);
                setIsUploading(false);
            },
            onError: (errors) => {
                toast.error('Upload failed');
                console.error(errors);
                setIsUploading(false);
            },
        });
    };

    const removeFile = (index: number) => {
        setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSaveMeta = () => {
        if (!selectedItem) return;
        setIsSavingMeta(true);
        router.patch(`/admin/media/${selectedItem.id}`, metaForm, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Media updated');
                // Update local state so the grid alt text reflects immediately
                setSelectedItem({
                    ...selectedItem,
                    custom_properties: { ...metaForm },
                });
            },
            onError: () => toast.error('Failed to save metadata'),
            onFinish: () => setIsSavingMeta(false),
        });
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Media" />

            <Wrapper>
                <PageHeader
                    title="Media Library"
                    description="Manage files and images"
                >
                    <PageHeaderActions>
                        <Button
                            variant="outline"
                            onClick={() =>
                                document.getElementById('file-upload')?.click()
                            }
                        >
                            <UploadIcon className="mr-2 h-4 w-4" />
                            Upload File
                        </Button>
                        <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            multiple
                            onChange={(e) => {
                                const files = e.target.files;
                                if (!files) return;
                                handleDropzoneUpload(Array.from(files));
                            }}
                        />
                    </PageHeaderActions>
                </PageHeader>

                <div className="mb-6">
                    <Dropzone
                        onFilesUploaded={handleDropzoneUpload}
                        uploading={isUploading}
                        accept={{
                            'image/*': [
                                '.png',
                                '.jpg',
                                '.jpeg',
                                '.gif',
                                '.webp',
                                '.svg',
                            ],
                            'video/*': ['.mp4', '.webm', '.mov'],
                            'audio/*': ['.mp3', '.wav', '.ogg'],
                            'application/pdf': ['.pdf'],
                            'application/msword': ['.doc'],
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                                ['.docx'],
                        }}
                        maxFiles={10}
                        maxSize={10 * 1024 * 1024}
                    />

                    {uploadingFiles.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                            {uploadingFiles.map((file, index) => (
                                <FilePreview
                                    key={`${file.name}-${index}`}
                                    file={file}
                                    onRemove={
                                        isUploading
                                            ? undefined
                                            : () => removeFile(index)
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 border-b pb-4">
                    <div className="relative max-w-md flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search files..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <select
                        value={extension}
                        onChange={(e) => handleExtensionFilter(e.target.value)}
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        <option value="">All types</option>
                        {extensions.map((ext) => (
                            <option key={ext} value={ext}>
                                .{ext}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                        {media.data.length === 0 ? (
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
                            <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                {media.data.map((item) => {
                                    const isSelected =
                                        selectedItem?.id === item.id;
                                    const Icon = getFileIcon(item.mime_type);
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() =>
                                                setSelectedItem(item)
                                            }
                                            className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all hover:ring-2 hover:ring-ring ${
                                                isSelected
                                                    ? 'border-primary ring-2 ring-primary'
                                                    : 'border-transparent'
                                            }`}
                                        >
                                            {item.mime_type.startsWith(
                                                'image/',
                                            ) ? (
                                                <img
                                                    src={item.thumbnail_url ?? item.url}
                                                    alt={item.custom_properties?.alt || item.name}
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-muted">
                                                    <Icon className="h-12 w-12 text-muted-foreground" />
                                                </div>
                                            )}
                                            {isSelected && (
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

                        {media.last_page > 1 && (
                            <div className="flex items-center justify-between border-t px-6 py-4">
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
                                        onClick={() =>
                                            handlePageChange(currentPage - 1)
                                        }
                                        disabled={!media.prev_page_url}
                                    >
                                        <ChevronLeftIcon className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handlePageChange(currentPage + 1)
                                        }
                                        disabled={!media.next_page_url}
                                    >
                                        Next
                                        <ChevronRightIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {selectedItem && (
                        <div className="w-80 shrink-0 overflow-y-auto border-l bg-muted/30">
                            <div className="flex items-center justify-between border-b px-4 py-3">
                                <h3 className="font-semibold">Details</h3>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setSelectedItem(null)}
                                >
                                    <XIcon className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="space-y-4 p-4">
                                {/* Preview */}
                                <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                                    {selectedItem.mime_type.startsWith(
                                        'image/',
                                    ) ? (
                                        <img
                                            src={selectedItem.url}
                                            alt={selectedItem.custom_properties?.alt || selectedItem.name}
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            {(() => {
                                                const Icon = getFileIcon(
                                                    selectedItem.mime_type,
                                                );
                                                return (
                                                    <Icon className="h-16 w-16 text-muted-foreground" />
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>

                                {/* File info */}
                                <div className="space-y-2">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">
                                            Name
                                        </Label>
                                        <p className="text-sm font-medium">
                                            {selectedItem.name}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">
                                            File name
                                        </Label>
                                        <p className="truncate text-sm">
                                            {selectedItem.file_name}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <Label className="text-xs text-muted-foreground">
                                                Type
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
                                                Size
                                            </Label>
                                            <p className="text-sm">
                                                {formatBytes(selectedItem.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">
                                            Uploaded
                                        </Label>
                                        <p className="text-sm">
                                            {new Date(
                                                selectedItem.created_at,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Editable metadata — available for all file types */}
                                <div className="space-y-3 border-t pt-3">
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Metadata
                                    </p>
                                    {/* Alt text + caption only make sense for images */}
                                    {selectedItem.mime_type.startsWith('image/') && (
                                        <>
                                            <div className="space-y-1">
                                                <Label htmlFor="meta-alt" className="text-xs">
                                                    Alt text
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
                                                    placeholder="Descriptive alt text (SEO + a11y)"
                                                    className="text-sm"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="meta-caption" className="text-xs">
                                                    Caption
                                                </Label>
                                                <Input
                                                    id="meta-caption"
                                                    value={metaForm.caption}
                                                    onChange={(e) =>
                                                        setMetaForm((f) => ({
                                                            ...f,
                                                            caption: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="Visible caption on page"
                                                    className="text-sm"
                                                />
                                            </div>
                                        </>
                                    )}
                                    <div className="space-y-1">
                                        <Label htmlFor="meta-description" className="text-xs">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="meta-description"
                                            value={metaForm.description}
                                            onChange={(e) =>
                                                setMetaForm((f) => ({
                                                    ...f,
                                                    description: e.target.value,
                                                }))
                                            }
                                            placeholder="Internal description"
                                            rows={2}
                                            className="text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="meta-author" className="text-xs">
                                            Author / Copyright
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
                                            placeholder="Photographer / source"
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
                                        {isSavingMeta ? 'Saving…' : 'Save metadata'}
                                    </Button>
                                </div>

                                {/* Actions */}
                                <div className="space-y-2 border-t pt-3">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() =>
                                            window.open(
                                                selectedItem.url,
                                                '_blank',
                                            )
                                        }
                                    >
                                        <EyeIcon className="mr-2 h-4 w-4" />
                                        View Full Size
                                    </Button>
                                    <ConfirmButton
                                        variant="outline"
                                        className="w-full"
                                        title="Delete File"
                                        description={`Are you sure you want to delete "${selectedItem.name}"? This action cannot be undone.`}
                                        onConfirm={() => {
                                            router.delete(
                                                `/admin/media/${selectedItem.id}`,
                                                {
                                                    onSuccess: () => {
                                                        toast.success(
                                                            'File deleted',
                                                        );
                                                        setSelectedItem(null);
                                                    },
                                                },
                                            );
                                        }}
                                    >
                                        <TrashIcon className="mr-2 h-4 w-4" />
                                        Delete
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
