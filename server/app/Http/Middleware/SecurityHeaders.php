<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! Vite::cspNonce()) {
            $nonce = bin2hex(random_bytes(16));
            Vite::useCspNonce($nonce);
        } else {
            $nonce = Vite::cspNonce();
        }

        /** @var Response $response */
        $response = $next($request);

        /** @var array<string, string> $headers */
        $headers = config('security.headers', []);

        $response->headers->set('X-Content-Type-Options', (string) $headers['x_content_type_options']);
        $response->headers->set('X-Frame-Options', (string) $headers['x_frame_options']);
        $response->headers->set('Referrer-Policy', (string) $headers['referrer_policy']);
        $response->headers->set('Permissions-Policy', (string) $headers['permissions_policy']);
        $response->headers->set('Cross-Origin-Opener-Policy', (string) $headers['cross_origin_opener_policy']);
        $response->headers->set('X-Permitted-Cross-Domain-Policies', (string) $headers['x_permitted_cross_domain_policies']);

        if ($request->isSecure() || $request->header('X-Forwarded-Proto') === 'https') {
            $response->headers->set('Strict-Transport-Security', (string) $headers['strict_transport_security']);
        }

        // Content Security Policy for HTML responses
        $contentType = $response->headers->get('Content-Type');
        if ($contentType && str_contains((string) $contentType, 'text/html') && ! $request->is('horizon*', 'telescope*')) {
            $isDev = app()->environment('local', 'testing');
            $frameAncestors = $isDev
                ? "frame-ancestors 'self' http://localhost:*"
                : "frame-ancestors 'self'";

            $csp = [
                "default-src 'self'",
                sprintf("script-src 'self' 'nonce-%s' 'strict-dynamic' ", $nonce).($isDev ? "'unsafe-eval'" : ''),
                "style-src 'self' 'unsafe-inline' https://fonts.bunny.net",
                "img-src 'self' data: blob: https:",
                "font-src 'self' https://fonts.bunny.net",
                "connect-src 'self' https: ".($isDev ? 'ws://localhost:* http://localhost:*' : ''),
                "frame-src 'self'",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                $frameAncestors,
            ];

            if (! $isDev) {
                $csp[] = 'upgrade-insecure-requests';
            }

            $response->headers->set('Content-Security-Policy', implode('; ', $csp));
        }

        return $response;
    }
}
