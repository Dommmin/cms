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

];
