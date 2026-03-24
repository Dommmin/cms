export type SeoData = {
    seo_title: string;
    seo_description: string;
    meta_robots: string;
    og_image: string | null;
    sitemap_exclude: boolean;
    canonical_url?: string;
};
export type SeoPanelProps = {
    data: SeoData;
    onChange: (field: string, value: string | boolean | null) => void;
    errors?: Record<string, string>;
    showCanonical?: boolean;
    urlPath?: string;
    titleFallback?: string;
    descriptionFallback?: string;
};
