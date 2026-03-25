<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

/**
 * Prevents duplicate POST operations by caching responses keyed on
 * the client-supplied Idempotency-Key header (RFC Draft compliant).
 */
class IdempotencyMiddleware
{
    private const string HEADER = 'Idempotency-Key';

    private const int TTL = 86400; // 24 hours

    private const int LOCK_TTL = 10; // seconds to wait for a concurrent identical request

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->method() !== 'POST') {
            return $next($request);
        }

        $idempotencyKey = $request->header(self::HEADER);

        if (! $idempotencyKey) {
            return $next($request);
        }

        $cacheKey = 'idempotency:'.hash(
            'sha256',
            implode('|', [
                $idempotencyKey,
                $request->user()?->id ?? 'guest',
                $request->path(),
            ])
        );

        if ($cached = Cache::get($cacheKey)) {
            return response()
                ->json(json_decode((string) $cached['body'], associative: true), $cached['status'])
                ->header('X-Idempotent-Replayed', 'true');
        }

        $lock = Cache::lock($cacheKey.':lock', self::LOCK_TTL);

        if (! $lock->get()) {
            return response()->json(
                ['message' => 'A request with this Idempotency-Key is already being processed.'],
                409
            );
        }

        try {
            $response = $next($request);

            if ($response->getStatusCode() < 500) {
                Cache::put($cacheKey, [
                    'body' => $response->getContent(),
                    'status' => $response->getStatusCode(),
                ], self::TTL);
            }

            return $response;
        } finally {
            $lock->release();
        }
    }
}
