export interface SearchResult {
    group: string;
    label: string;
    meta?: string | null;
    url: string;
}
export interface NavShortcut {
    group: 'Navigate';
    label: string;
    meta?: string;
    url: string;
    icon: React.ReactNode;
}
