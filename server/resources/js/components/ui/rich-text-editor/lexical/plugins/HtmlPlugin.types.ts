export interface HtmlPluginProps {
    value?: string;
    onChange?: (html: string) => void;
    onJsonChange?: (json: string) => void;
    /** When this key changes the editor history is cleared and content is reset (e.g. locale switch). */
    instanceKey?: string;
}
