<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Adds appropriate Cache-Control headers to API responses so that
 * Cloudflare (and other reverse-proxies) can cache public endpoints
 * while never caching authenticated, mutating, or error responses.
 */
final class ApiCacheHeaders
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! $response instanceof Response) {
            return $response;
        }

        // Never cache error responses
        if ($response->getStatusCode() >= 400) {
            $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate');
            $response->headers->set('Pragma', 'no-cache');

            return $response;
        }

        // Never cache mutating requests
        if (! $request->isMethod('GET') && ! $request->isMethod('HEAD')) {
            $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate');
            $response->headers->set('Pragma', 'no-cache');

            return $response;
        }

        // Never cache authenticated / session-based requests
        if ($this->isAuthenticatedRequest($request)) {
            $response->headers->set('Cache-Control', 'private, no-store');

            return $response;
        }

        // Per-path TTLs for public GET endpoints
        $cacheControl = $this->resolveCacheControl($request);

        $response->headers->set('Cache-Control', $cacheControl);

        // Vary so proxies key by encoding + language + cart token
        $response->headers->set('Vary', 'Accept-Encoding, Accept-Language, X-Cart-Token');

        return $response;
    }

    private function isAuthenticatedRequest(Request $request): bool
    {
        // Bearer token present
        if ($request->bearerToken() !== null) {
            return true;
        }

        // Authorization header present
        if ($request->hasHeader('Authorization')) {
            return true;
        }

        // Authenticated session
        if ($request->user() !== null) {
            return true;
        }

        // Cart / account / order specific paths are always user-specific
        $path = $request->path();
        $privatePaths = [
            'api/v1/cart',
            'api/v1/orders',
            'api/v1/account',
            'api/v1/profile',
            'api/v1/wishlist',
            'api/v1/checkout',
            'api/v1/payments',
            'api/v1/reviews',
            'api/v1/support',
            'api/v1/notifications',
            'api/v1/notification-preferences',
            'api/v1/push-subscriptions',
            'api/v1/addresses',
        ];

        return array_any($privatePaths, fn ($privatePath): bool => str_starts_with($path, (string) $privatePath));
    }

    private function resolveCacheControl(Request $request): string
    {
        $path = $request->path();

        // Settings public — cache 1 hour
        if ($path === 'api/v1/settings/public') {
            return 'public, s-maxage=3600, stale-while-revalidate=86400';
        }

        // Blog posts — cache 10 minutes
        if (str_starts_with($path, 'api/v1/blog')) {
            return 'public, s-maxage=600, stale-while-revalidate=7200';
        }

        // Products — cache 5 minutes
        if (str_starts_with($path, 'api/v1/products')) {
            return 'public, s-maxage=300, stale-while-revalidate=3600';
        }

        // Categories — cache 5 minutes
        if (str_starts_with($path, 'api/v1/categories')) {
            return 'public, s-maxage=300, stale-while-revalidate=3600';
        }

        // Locales / translations — cache 1 hour (rarely change)
        if (
            str_starts_with($path, 'api/v1/locales') ||
            str_starts_with($path, 'api/v1/translations')
        ) {
            return 'public, s-maxage=3600, stale-while-revalidate=86400';
        }

        // Pages / menus / FAQ / stores — moderate cache
        if (
            str_starts_with($path, 'api/v1/pages') ||
            str_starts_with($path, 'api/v1/menus') ||
            str_starts_with($path, 'api/v1/faq') ||
            str_starts_with($path, 'api/v1/stores')
        ) {
            return 'public, s-maxage=300, stale-while-revalidate=3600';
        }

        // Default: short public cache
        return 'public, s-maxage=60, stale-while-revalidate=300';
    }
}
