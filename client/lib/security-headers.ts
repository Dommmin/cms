type StaticSecurityHeader = {
    key: string;
    value: string;
};

type StaticSecurityHeaderOptions = {
    includeStrictTransportSecurity?: boolean;
};

type ContentSecurityPolicyOptions = {
    isDevelopment?: boolean;
    nonce: string;
};

const STOREFRONT_PERMISSIONS_POLICY =
    'camera=(), microphone=(), geolocation=(self "https://geowidget-app.inpost.pl" "https://geowidget.inpost.pl")';

export function buildStaticSecurityHeaders(
    options: StaticSecurityHeaderOptions = {},
): StaticSecurityHeader[] {
    const headers: StaticSecurityHeader[] = [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
        },
        {
            key: 'Permissions-Policy',
            value: STOREFRONT_PERMISSIONS_POLICY,
        },
        {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
        },
        {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
        },
    ];

    if (options.includeStrictTransportSecurity) {
        headers.push({
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
        });
    }

    return headers;
}

export function buildContentSecurityPolicy({
    isDevelopment = false,
    nonce,
}: ContentSecurityPolicyOptions): string {
    const frameAncestors = isDevelopment
        ? "frame-ancestors 'self' http://localhost:*"
        : "frame-ancestors 'self'";

    return [
        `default-src 'self'`,
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com ${isDevelopment ? "'unsafe-eval'" : ''}`,
        `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
        `img-src 'self' data: blob: https: ${isDevelopment ? 'http:' : ''}`,
        `font-src 'self' https://fonts.gstatic.com`,
        `connect-src 'self' https: ${isDevelopment ? 'http://localhost:*' : ''}`,
        `frame-src 'self' https://www.google.com https://geowidget-app.inpost.pl https://geowidget.inpost.pl`,
        `object-src 'none'`,
        `base-uri 'self'`,
        `form-action 'self'`,
        frameAncestors,
        `upgrade-insecure-requests`,
    ]
        .filter(Boolean)
        .join('; ');
}
