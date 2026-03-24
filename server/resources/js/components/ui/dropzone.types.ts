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
