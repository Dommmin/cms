export type Theme = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    tokens?: Record<string, string> | null;
    typography?: {
        heading_font?: string;
        body_font?: string;
        base_size?: string;
        scale?: string;
        h1_size?: string;
        h2_size?: string;
        h3_size?: string;
        h4_size?: string;
    } | null;
    spacing?: {
        section_padding?: string;
        block_gap?: string;
        container_padding?: string;
    } | null;
    buttons?: {
        primary_border_radius?: string;
        primary_padding_x?: string;
        primary_padding_y?: string;
        secondary_border_radius?: string;
        secondary_padding_x?: string;
        secondary_padding_y?: string;
    } | null;
    containers?: {
        max_width?: string;
        content_width?: string;
        narrow_width?: string;
    } | null;
    is_active: boolean;
    pages_count: number;
};
export type EditProps = {
    theme: Theme;
};
