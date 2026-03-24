export type EditorProps = {
    value?: string;
    onChange?: (html: string) => void;
    placeholder?: string;
    className?: string;
    maxHeight?: number | string;
    editable?: boolean;
    showWordCount?: boolean;
};
