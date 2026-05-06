export type EditorProps = {
    value?: string;
    onChange?: (html: string) => void;
    placeholder?: string;
    className?: string;
    maxHeight?: number | string;
    editable?: boolean;
    showWordCount?: boolean;
    /** Passed to HtmlPlugin — when it changes, editor history is cleared (e.g. locale switch). */
    instanceKey?: string;
};
