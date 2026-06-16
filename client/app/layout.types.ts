import type { CookieSettings } from '@/components/cookie-consent.types';
import type { BlockRelation } from '@/types/api';

export type Modules = {
    blog: boolean;
    ecommerce: boolean;
    newsletter: boolean;
    marketing: boolean;
};

export type ActiveTheme = {
    slug: string;
    tokens?: Record<string, string> | null;
    dark_tokens?: Record<string, string> | null;
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
    font_sources?: {
        heading?: {
            family: string;
            source: 'google' | 'system' | 'custom';
            weights?: string[];
            url?: string;
        };
        body?: {
            family: string;
            source: 'google' | 'system' | 'custom';
            weights?: string[];
            url?: string;
        };
    } | null;
    branding?: {
        logo_url?: string | null;
        logo_dark_url?: string | null;
        favicon_url?: string | null;
    } | null;
};

export type SlotSettings = {
    full_width?: boolean;
    sticky?: boolean;
    dismissible?: boolean;
    bg_color?: string | null;
    padding?: 'none' | 'sm' | 'md' | 'lg';
};

export type SlotEntry = {
    id: number;
    label: string;
    block_type: string;
    configuration: Record<string, unknown>;
    relations?: BlockRelation[];
    settings: SlotSettings;
    position: number;
};

export type PublicSettingsResponse = {
    settings: {
        general?: {
            site_name?: string;
            site_url?: string;
            site_description?: string;
            contact_email?: string;
            contact_phone?: string;
            maintenance_mode?: string | boolean;
            maintenance_until?: string;
        };
        seo?: {
            google_tag_manager?: string;
            google_site_verification?: string;
            bing_site_verification?: string;
            disable_indexing?: string | boolean;
            og_image?: string;
            twitter_handle?: string;
        };
        social?: Record<string, string>;
        cookie?: CookieSettings;
        shipping?: {
            inpost_geowidget_token?: string;
        };
        integrations?: {
            google_maps_api_key?: string;
        };
    };
    legal?: {
        consent_version: string;
        consent_version_snapshot: {
            privacy_policy?: string | null;
            cookie_policy?: string | null;
        };
    };
    modules?: Modules;
    theme?: ActiveTheme | null;
    slots?: Record<string, SlotEntry[]>;
};
