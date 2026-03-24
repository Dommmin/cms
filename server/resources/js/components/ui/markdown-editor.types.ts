export interface MarkdownEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    className?: string;
    minHeight?: number;
}
