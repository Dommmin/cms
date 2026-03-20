<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Reads the real client IP from the CF-Connecting-IP header set by Cloudflare.
 *
 * Must be registered as the first middleware so that $request->ip() returns the
 * real user IP in all downstream middleware (rate limiters, logging, etc.).
 *
 * Security note: in production, Nginx should strip CF-Connecting-IP headers that
 * do NOT originate from Cloudflare's IP ranges (see docs/deployment.md).
 */
class TrustCloudflareProxies
{
    public function handle(Request $request, Closure $next): Response
    {
        $cfIp = $request->header('CF-Connecting-IP');

        if ($cfIp && filter_var($cfIp, FILTER_VALIDATE_IP)) {
            $request->server->set('REMOTE_ADDR', $cfIp);
        }

        return $next($request);
    }
}
