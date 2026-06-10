import type { Auth } from './auth';
import '@inertiajs/core';
import '@inertiajs/react';

export interface SharedLocale {
    code: string;
    name: string;
    native_name: string | null;
    flag_emoji: string | null;
    is_default: boolean;
}

export interface ActiveThemeSharedProp {
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

declare module '@inertiajs/core' {
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

declare module '@inertiajs/react' {
    import type { Page } from '@inertiajs/core';

    export interface PageProps {
        name: string;
        auth: Auth;
        sidebarOpen: boolean;
        frontendUrl: string;
        activeTheme?: ActiveThemeSharedProp | null;
        locales: SharedLocale[];
        modules: Modules;
        [key: string]: unknown;
    }

    export function usePage<
        TPageProps extends Record<string, unknown> = Record<string, unknown>,
    >(): Page<TPageProps & PageProps>;
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
