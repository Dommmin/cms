import type { MetadataRoute } from 'next';

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'Store';
const appDescription =
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ??
    'Mobile-friendly storefront for browsing products, managing cart, and checking out.';
const startUrl = process.env.NEXT_PUBLIC_PWA_START_URL ?? '/';
const themeColor = process.env.NEXT_PUBLIC_PWA_THEME_COLOR ?? '#111827';
const backgroundColor =
    process.env.NEXT_PUBLIC_PWA_BACKGROUND_COLOR ?? '#ffffff';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: appName,
        short_name: appName.length > 12 ? appName.slice(0, 12) : appName,
        description: appDescription,
        start_url: startUrl,
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: backgroundColor,
        theme_color: themeColor,
        categories: ['shopping', 'lifestyle'],
        icons: [
            {
                src: '/pwa/icon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
                purpose: 'any',
            },
            {
                src: '/pwa/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/pwa/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/pwa/maskable-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/pwa/maskable-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
        shortcuts: [
            {
                name: 'Products',
                short_name: 'Products',
                url: '/products',
                icons: [{ src: '/pwa/icon-192.png', sizes: '192x192' }],
            },
            {
                name: 'Cart',
                short_name: 'Cart',
                url: '/cart',
                icons: [{ src: '/pwa/icon-192.png', sizes: '192x192' }],
            },
        ],
    };
}
