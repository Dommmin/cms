import { Upload, X, Image, FileText, Film, Music } from 'lucide-react';
import { createElement, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from '@/hooks/use-translation';
import { cn, formatFileSize } from '@/lib/utils';

export interface DropzoneProps {
    onFilesUploaded?: (files: File[]) => void;
    accept?: Record<string, string[]>;
    maxFiles?: number;
    maxSize?: number;
    disabled?: boolean;
    className?: string;
    uploading?: boolean;
}

export interface FilePreviewProps {
    file: File;
    onRemove?: () => void;
    className?: string;
}

function getFileIcon(mimeType: string) {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Film;
    if (mimeType.startsWith('audio/')) return Music;
    return FileText;
}

export function Dropzone({
    onFilesUploaded,
    accept = {
        'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
        'video/*': ['.mp4', '.webm', '.mov'],
        'audio/*': ['.mp3', '.wav', '.ogg'],
        'application/pdf': ['.pdf'],
    },
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024,
    disabled = false,
    className,
    uploading = false,
}: DropzoneProps) {
    const __ = useTranslation();
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (onFilesUploaded) {
                onFilesUploaded(acceptedFiles);
            }
        },
        [onFilesUploaded],
    );

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragReject,
    } = useDropzone({
        onDrop,
        accept,
        maxFiles,
        maxSize,
        disabled: disabled || uploading,
    });

    return (
        <div
            {...getRootProps()}
            className={cn(
                'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
                'hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-black',
                isDragActive && 'border-blue-500 bg-blue-50',
                isDragReject && 'border-red-500 bg-red-50',
                (disabled || uploading) && 'cursor-not-allowed opacity-50',
                className,
            )}
        >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center gap-3 text-center">
                {uploading ? (
                    <>
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                        <p className="text-sm font-medium text-gray-700">{__('action.uploading', 'Uploading...')}</p>
                    </>
                ) : (
                    <>
                        <div
                            className={cn(
                                'flex h-12 w-12 items-center justify-center rounded-full',
                                isDragActive ? 'bg-blue-100' : 'bg-gray-100',
                            )}
                        >
                            <Upload
                                className={cn(
                                    'h-6 w-6',
                                    isDragActive ? 'text-blue-600' : 'text-gray-500',
                                )}
                            />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-300">
                                {isDragActive
                                    ? __('misc.drop_files_here', 'Drop files here')
                                    : __('misc.drag_drop_here', 'Drag & drop files here')}
                            </p>
                            <p className="text-xs text-gray-500">
                                {`${__('misc.or_click_select', 'or click to select files')} (max ${maxFiles}, up to ${formatFileSize(maxSize)})`}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export function FilePreview({ file, onRemove, className }: FilePreviewProps) {
    const isImage = file.type.startsWith('image/');
    const Icon = getFileIcon(file.type);

    return (
        <div
            className={cn(
                'relative flex items-center gap-3 rounded-lg border bg-white p-2 shadow-sm',
                className,
            )}
        >
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded bg-gray-100">
                {isImage ? (
                    <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    createElement(Icon, { className: 'h-6 w-6 text-gray-400' })
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">
                    {file.name}
                </p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            </div>
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
                >
                    <X className="h-4 w-4 text-gray-500" />
                </button>
            )}
        </div>
    );
}
