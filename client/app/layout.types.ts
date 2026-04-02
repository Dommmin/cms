import type { CookieSettings } from '@/components/cookie-consent.types';

export type PublicSettingsResponse = {
    settings: {
        general?: {
            site_name?: string;
            site_url?: string;
            site_description?: string;
            contact_email?: string;
            contact_phone?: string;
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
    };
};
