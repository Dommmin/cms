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

        // Standard security headers on all responses
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

        // Content Security Policy for HTML responses
        $contentType = $response->headers->get('Content-Type');
        if ($contentType && str_contains((string) $contentType, 'text/html')) {
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
                'upgrade-insecure-requests',
            ];

            $response->headers->set('Content-Security-Policy', implode('; ', $csp));
        }

        return $response;
    }
}
