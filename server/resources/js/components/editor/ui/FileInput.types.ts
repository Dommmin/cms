export interface FileInputProps {
    label: string;
    onChange: (files: FileList | null) => void;
    accept?: string;
    className?: string;
}
