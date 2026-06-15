import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';
import { buildStaticSecurityHeaders } from './lib/security-headers';

const errorTrackingDsn =
    process.env.NEXT_PUBLIC_GLITCHTIP_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

function getApiHostname(): string {
    const url = process.env.NEXT_PUBLIC_API_URL;

    if (!url) {
        return 'localhost';
    }

    try {
        return new URL(url).hostname;
    } catch {
        return 'localhost';
    }
}

const apiHostname = getApiHostname();

const nextConfig: NextConfig = {
    output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
    poweredByHeader: false,
    compress: true,
    reactStrictMode: true,

    experimental: {
        optimizePackageImports: [
            '@headlessui/react',
            '@heroicons/react',
            '@radix-ui/react-icons',
            'lucide-react',
            'framer-motion',
        ],
    },

    typescript: {
        ignoreBuildErrors: process.env.DOCKER_BUILD === '1',
    },

    webpack: (config) => {
        config.watchOptions = {
            poll: process.env.WATCHPACK_POLLING === 'true' ? 1000 : false,
            ignored: [
                '**/node_modules/**',
                '**/.git/**',
                '**/.next/cache/**',
                '**/coverage/**',
                '**/playwright-report/**',
                '**/test-results/**',
            ],
        };
        return config;
    },

    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: apiHostname,
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: apiHostname,
                pathname: '/**',
            },
            ...(apiHostname !== 'localhost'
                ? [
                      {
                          protocol: 'http' as const,
                          hostname: 'localhost',
                          pathname: '/**',
                      },
                  ]
                : []),
            {
                protocol: 'https',
                hostname: '**.amazonaws.com',
                pathname: '/**',
            },
        ],
    },

    async headers() {
        const securityHeaders = buildStaticSecurityHeaders({
            includeStrictTransportSecurity:
                process.env.NODE_ENV === 'production',
        });

        return [
            {
                source: '/(.*)',
                headers: securityHeaders,
            },
            {
                source: '/_next/static/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                    {
                        key: 'Cloudflare-CDN-Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/sw.js',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'application/javascript; charset=utf-8',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'no-cache, no-store, must-revalidate',
                    },
                ],
            },
            {
                source: '/(:path*\\.(?:ico|png|jpg|jpeg|webp|svg|woff2|woff|ttf|otf))',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                    {
                        key: 'Cloudflare-CDN-Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/:locale(en|pl)/(products|categories|blog)(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, s-maxage=300, stale-while-revalidate=3600',
                    },
                    {
                        key: 'Cloudflare-CDN-Cache-Control',
                        value: 'public, max-age=300, stale-while-revalidate=3600',
                    },
                ],
            },
            {
                source: '/:locale(en|pl)/(flash-sales|stores)(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, s-maxage=120, stale-while-revalidate=600',
                    },
                    {
                        key: 'Cloudflare-CDN-Cache-Control',
                        value: 'public, max-age=120, stale-while-revalidate=600',
                    },
                ],
            },
            {
                source: '/:locale(en|pl)/(checkout|account)(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'private, no-store',
                    },
                    {
                        key: 'Surrogate-Control',
                        value: 'no-store',
                    },
                    {
                        key: 'Cloudflare-CDN-Cache-Control',
                        value: 'private, no-store',
                    },
                ],
            },
        ];
    },
};

const sentryConfig = {
    silent: !errorTrackingDsn,
    disableLogger: true,
};

export default errorTrackingDsn
    ? withSentryConfig(nextConfig, sentryConfig)
    : nextConfig;
