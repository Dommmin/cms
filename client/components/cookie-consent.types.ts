export interface ConsentState {
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
}
export interface StoredConsent {
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
    version: string;
}
export interface CookieSettings {
    banner_title?: string;
    banner_description?: string;
    privacy_policy_url?: string;
    cookie_policy_url?: string;
    analytics_description?: string;
    marketing_description?: string;
    consent_version?: string;
}
export interface CookieConsentProps {
    settings?: CookieSettings;
}
