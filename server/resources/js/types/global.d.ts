import type { Auth } from '@/types/auth';

export interface SharedLocale {
    code: string;
    name: string;
    native_name: string | null;
    flag_emoji: string | null;
    is_default: boolean;
}

declare module '@inertiajs/core' {
    interface ActiveThemeSharedProp {
        id: number;
        slug: string;
        tokens?: Record<string, string> | null;
    }

    export interface Modules {
        blog: boolean;
        ecommerce: boolean;
        newsletter: boolean;
        marketing: boolean;
    }

    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            frontendUrl: string;
            activeTheme?: ActiveThemeSharedProp | null;
            locales: SharedLocale[];
            modules: Modules;
            [key: string]: unknown;
        };
    }
}

declare module 'trix' {
    export class Editor {
        constructor(config: { element: HTMLTextAreaElement });
        getHTML(): string;
        loadHTML(html: string): void;
        destroy(): void;
    }
}

declare global {
    interface Window {
        Trix: {
            Editor: new (config: { element: HTMLTextAreaElement }) => {
                getHTML(): string;
                loadHTML(html: string): void;
                destroy(): void;
            };
        };
    }
}

export {};
