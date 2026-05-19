export type EditorProps = {
    value?: string;
    onChange?: (html: string) => void;
    jsonValue?: string;
    onJsonChange?: (json: string) => void;
    placeholder?: string;
    className?: string;
    maxHeight?: number | string;
    editable?: boolean;
    mode?: 'simple' | 'full';
    showWordCount?: boolean;
    /** Passed to HtmlPlugin — when it changes, editor history is cleared (e.g. locale switch). */
    instanceKey?: string;
};
