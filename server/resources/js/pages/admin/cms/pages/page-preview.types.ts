export type Cfg = Record<string, any>;
export type PreviewBlock = {
    id: number;
    type: string;
    configuration: Cfg;
};
export type PreviewSection = {
    id: number;
    section_type: string;
    layout: string;
    variant: string | null;
    settings: Cfg | null;
    blocks: PreviewBlock[];
};
export type PagePreviewProps = {
    page: { id: number; title: string | Record<string, string>; slug: string };
    sections: PreviewSection[];
};
