import {
    buildContentSecurityPolicy,
    buildStaticSecurityHeaders,
} from '@/lib/security-headers';
import { describe, expect, it } from 'vitest';

describe('security headers', () => {
    it('returns the standard storefront security headers', () => {
        const headers = buildStaticSecurityHeaders({
            includeStrictTransportSecurity: true,
        });

        expect(headers).toContainEqual({
            key: 'X-Content-Type-Options',
            value: 'nosniff',
        });
        expect(headers).toContainEqual({
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
        });
        expect(headers).toContainEqual({
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
        });
        expect(headers).toContainEqual({
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
        });
    });

    it('builds a nonce-based CSP for production storefront requests', () => {
        const csp = buildContentSecurityPolicy({
            nonce: 'nonce-123',
        });

        expect(csp).toContain(
            "script-src 'self' 'nonce-nonce-123' 'strict-dynamic'",
        );
        expect(csp).toContain("frame-ancestors 'self'");
        expect(csp).toContain(
            'https://geowidget-app.inpost.pl https://geowidget.inpost.pl',
        );
        expect(csp).not.toContain("'unsafe-eval'");
    });
});
