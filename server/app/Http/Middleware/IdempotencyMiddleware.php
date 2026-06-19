<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Http\Middleware\Idempotency\IdempotencyRecord;
use Closure;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use JsonException;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

/**
 * Prevents duplicate POST operations by caching the first response keyed on the
 * client-supplied Idempotency-Key header (RFC draft / Stripe-style semantics).
 *
 * Guarantees:
 *  - A retried request with the same key replays the original response verbatim.
 *  - Reusing a key with a *different* payload is rejected (422) rather than
 *    silently returning the wrong cached response.
 *  - Concurrent identical requests are serialized via a lock; the loser waits
 *    for and replays the winner's response instead of double-executing.
 *  - A key is scoped to its issuing principal (user id, or hashed IP for
 *    guests) so one caller can never read another caller's cached response.
 */
final class IdempotencyMiddleware
{
    private const string HEADER = 'Idempotency-Key';

    /** Fallback replay window when config is absent. */
    private const int DEFAULT_TTL = 86_400; // 24 hours

    /** Fallback lock lifetime — outlasts a slow handler, self-heals after a crash. */
    private const int DEFAULT_LOCK_SECONDS = 90;

    /** Fallback wait before a concurrent caller gives up. */
    private const int DEFAULT_LOCK_WAIT_SECONDS = 5;

    /** Reject keys longer than this (matches Stripe's limit) to bound cache/hashing cost. */
    private const int DEFAULT_MAX_KEY_LENGTH = 255;

    /** Do not cache response bodies longer than this (~1 MiB of characters) to bound cache memory. */
    private const int DEFAULT_MAX_BODY_LENGTH = 1_048_576;

    /**
     * Response headers that must never be captured/restored: they are
     * connection-, body-, or session-specific and must not be replayed from a
     * cached entry. `set-cookie` in particular would leak a stale session,
     * CSRF, or cart cookie onto a later request.
     *
     * @var list<string>
     */
    private const array VOLATILE_HEADERS = [
        'date',
        'host',
        'connection',
        'content-length',
        'transfer-encoding',
        'set-cookie',
        'x-idempotent-replayed',
    ];

    public function handle(Request $request, Closure $next): SymfonyResponse
    {
        if (! $request->isMethod('POST')) {
            return $next($request);
        }

        $idempotencyKey = $request->header(self::HEADER);

        if (! is_string($idempotencyKey) || mb_trim($idempotencyKey) === '') {
            return $next($request);
        }

        if (mb_strlen($idempotencyKey) > (int) config('idempotency.max_key_length', self::DEFAULT_MAX_KEY_LENGTH)) {
            return $this->malformedKey();
        }

        $cacheKey = $this->cacheKey($request, $idempotencyKey);
        $fingerprint = $this->fingerprint($request);

        // Fast path: a prior request already produced a cached response.
        if (($replay = $this->resolveCached($cacheKey, $fingerprint)) instanceof SymfonyResponse) {
            return $replay;
        }

        $lockSeconds = (int) config('idempotency.lock_seconds', self::DEFAULT_LOCK_SECONDS);
        $lockWaitSeconds = (int) config('idempotency.lock_wait_seconds', self::DEFAULT_LOCK_WAIT_SECONDS);

        try {
            return Cache::lock($cacheKey.':lock', $lockSeconds)->block(
                $lockWaitSeconds,
                function () use ($request, $next, $cacheKey, $fingerprint): SymfonyResponse {
                    // The request we waited on may have populated the cache while we blocked.
                    if (($replay = $this->resolveCached($cacheKey, $fingerprint)) instanceof SymfonyResponse) {
                        return $replay;
                    }

                    $response = $next($request);

                    if ($this->isStorable($response)) {
                        $this->store($cacheKey, $fingerprint, $response);
                    }

                    return $response;
                }
            );
        } catch (LockTimeoutException) {
            return $this->conflict();
        }
    }

    /**
     * Resolve a cached response for the given key, if any.
     *
     * Returns a replayed response on a fingerprint match, a 422 on a mismatch
     * (key reused with a different payload), or null when there is nothing
     * usable cached (miss or corrupt entry) so the caller proceeds normally.
     */
    private function resolveCached(string $cacheKey, string $fingerprint): ?SymfonyResponse
    {
        $record = IdempotencyRecord::fromCache(Cache::get($cacheKey));

        if (! $record instanceof IdempotencyRecord) {
            return null;
        }

        if (! hash_equals($record->fingerprint, $fingerprint)) {
            return $this->fingerprintMismatch();
        }

        return $this->replay($record);
    }

    /**
     * Whether a response may be safely cached for replay.
     *
     * Server errors (5xx) stay retryable; streamed/binary responses have no
     * retrievable body; oversized bodies are skipped to bound cache memory.
     */
    private function isStorable(SymfonyResponse $response): bool
    {
        if ($response->getStatusCode() >= 500) {
            return false;
        }

        $content = $response->getContent();

        if (! is_string($content)) {
            return false;
        }

        return mb_strlen($content) <= (int) config('idempotency.max_body_length', self::DEFAULT_MAX_BODY_LENGTH);
    }

    /**
     * Persist the response so later retries can replay it byte-for-byte.
     */
    private function store(string $cacheKey, string $fingerprint, SymfonyResponse $response): void
    {
        $record = new IdempotencyRecord(
            fingerprint: $fingerprint,
            body: (string) $response->getContent(),
            status: $response->getStatusCode(),
            headers: $this->captureHeaders($response),
            createdAt: now()->toIso8601String(),
        );

        Cache::put($cacheKey, $record->toArray(), (int) config('idempotency.ttl', self::DEFAULT_TTL));
    }

    /**
     * Rebuild a response from a stored record, restoring all original headers.
     *
     * A JSON body is replayed as a {@see JsonResponse} so downstream middleware
     * that only passes through JSON responses (e.g. ForceJsonResponse) does not
     * re-wrap or corrupt the replayed payload. The stored body is already
     * encoded, so it is set verbatim rather than re-encoded.
     */
    private function replay(IdempotencyRecord $record): SymfonyResponse
    {
        $contentType = $record->headers['content-type'][0] ?? null;
        $isJson = is_string($contentType) && str_contains($contentType, 'application/json');

        $response = $isJson
            ? new JsonResponse($record->body, $record->status, json: true)
            : new Response($record->body, $record->status);

        foreach ($record->headers as $name => $values) {
            $response->headers->set($name, $values, replace: true);
        }

        return $response->header('X-Idempotent-Replayed', 'true');
    }

    /**
     * Snapshot replayable response headers, dropping connection/body-specific ones.
     *
     * @return array<string, list<string>>
     */
    private function captureHeaders(SymfonyResponse $response): array
    {
        return array_diff_key(
            $response->headers->all(),
            array_flip(self::VOLATILE_HEADERS),
        );
    }

    /**
     * Cache key isolating the entry to its principal and route, so a key issued
     * by one caller can never collide with or expose another caller's response.
     */
    private function cacheKey(Request $request, string $idempotencyKey): string
    {
        return 'idempotency:'.hash('sha256', implode('|', [
            $idempotencyKey,
            $this->scope($request),
            $request->path(),
        ]));
    }

    /**
     * Deterministic fingerprint of the request's meaningful inputs. Two requests
     * with the same key but differing fingerprints are treated as a conflict.
     */
    private function fingerprint(Request $request): string
    {
        return hash('sha256', implode('|', [
            $request->method(),
            $request->path(),
            $this->scope($request),
            $this->normalizedPayload($request),
        ]));
    }

    /**
     * Stable JSON encoding of the payload with recursively sorted keys, so that
     * key ordering does not affect the fingerprint.
     */
    private function normalizedPayload(Request $request): string
    {
        $payload = $request->all();
        $this->ksortRecursive($payload);

        try {
            return json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
        } catch (JsonException) {
            // Non-encodable payload: fall back to a stable marker rather than failing.
            return 'unencodable-payload';
        }
    }

    /**
     * @param  array<array-key, mixed>  $array
     */
    private function ksortRecursive(array &$array): void
    {
        foreach ($array as &$value) {
            if (is_array($value)) {
                $this->ksortRecursive($value);
            }
        }

        unset($value);

        ksort($array);
    }

    /**
     * Principal scope for keying/fingerprinting: the authenticated user id, or a
     * hashed client IP for guests (never a shared literal that would let
     * unrelated anonymous callers collide).
     */
    private function scope(Request $request): string
    {
        $user = $request->user();

        if ($user !== null) {
            return 'user:'.$user->getAuthIdentifier();
        }

        return 'ip:'.hash('sha256', (string) $request->ip());
    }

    private function fingerprintMismatch(): JsonResponse
    {
        return new JsonResponse(
            ['message' => 'The Idempotency-Key has already been used with a different request payload.'],
            422,
        );
    }

    private function conflict(): JsonResponse
    {
        return new JsonResponse(
            ['message' => 'A request with this Idempotency-Key is already being processed. Please retry shortly.'],
            409,
        );
    }

    private function malformedKey(): JsonResponse
    {
        return new JsonResponse(
            ['message' => 'The Idempotency-Key header is too long.'],
            400,
        );
    }
}
