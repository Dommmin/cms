import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const errorTrackingDsn =
    process.env.NEXT_PUBLIC_GLITCHTIP_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

const apiHostname = process.env.NEXT_PUBLIC_API_URL
    ? new URL(process.env.NEXT_PUBLIC_API_URL).hostname
    : 'localhost';

const nextConfig: NextConfig = {
    output: 'standalone',
    poweredByHeader: false,
    compress: true,
    // Skip redundant checks in Docker builds — lint job already runs these
    typescript: { ignoreBuildErrors: process.env.DOCKER_BUILD === '1' },
    eslint: { ignoreDuringBuilds: process.env.DOCKER_BUILD === '1' },
    images: {
        remotePatterns: [
            {
                // Laravel API / storage (nginx on default port 80)
                protocol: 'http',
                hostname: apiHostname,
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: apiHostname,
                pathname: '/**',
            },
            {
                // Spatie media-library often serves from a CDN or S3
                protocol: 'https',
                hostname: '**.amazonaws.com',
                pathname: '/**',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
            {
                // Immutable cache for hashed Next.js static assets
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
                // Static public files (favicons, fonts, images, icons)
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
                // Public content pages: stale-while-revalidate at edge
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
                // Flash sales and stores pages — moderate cache
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
                // Checkout and account pages: never cache (private, user-specific)
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
    // Keep the Sentry-compatible build wrapper for GlitchTip, but avoid
    // requiring Sentry SaaS-specific org/project settings.
    silent: !errorTrackingDsn,
    disableLogger: true,
};

export default errorTrackingDsn
    ? withSentryConfig(nextConfig, sentryConfig)
    : nextConfig;
