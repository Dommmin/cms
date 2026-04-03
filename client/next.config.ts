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
