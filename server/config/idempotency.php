<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Replay Window (seconds)
    |--------------------------------------------------------------------------
    |
    | How long a cached response remains replayable for a given Idempotency-Key.
    |
    */
    'ttl' => (int) env('IDEMPOTENCY_TTL', 86_400),

    /*
    |--------------------------------------------------------------------------
    | Lock Lifetime (seconds)
    |--------------------------------------------------------------------------
    |
    | Lifetime of the per-key lock that serializes concurrent identical
    | requests. Long enough to outlast a slow handler, short enough to
    | self-heal if the holder crashes without releasing it.
    |
    */
    'lock_seconds' => (int) env('IDEMPOTENCY_LOCK_SECONDS', 90),

    /*
    |--------------------------------------------------------------------------
    | Lock Wait (seconds)
    |--------------------------------------------------------------------------
    |
    | How long a concurrent caller blocks waiting for the in-flight request to
    | finish before giving up with HTTP 409.
    |
    */
    'lock_wait_seconds' => (int) env('IDEMPOTENCY_LOCK_WAIT_SECONDS', 5),

    /*
    |--------------------------------------------------------------------------
    | Maximum Idempotency-Key Length
    |--------------------------------------------------------------------------
    |
    | Requests carrying a longer key are rejected with HTTP 400. Bounds the
    | cost of hashing and prevents abuse via oversized headers.
    |
    */
    'max_key_length' => (int) env('IDEMPOTENCY_MAX_KEY_LENGTH', 255),

    /*
    |--------------------------------------------------------------------------
    | Maximum Cached Body Length (characters)
    |--------------------------------------------------------------------------
    |
    | Responses with a longer body are returned normally but not cached for
    | replay, keeping the cache store from growing unbounded.
    |
    */
    'max_body_length' => (int) env('IDEMPOTENCY_MAX_BODY_LENGTH', 1_048_576),

];
