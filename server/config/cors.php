<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | allowed_origins: Use '*' for fully public endpoints, or restrict to your
    | frontend domain(s) via CORS_ALLOWED_ORIGINS env variable.
    |
    | Mobile apps (iOS/Android) are not subject to CORS restrictions, so this
    | config applies primarily to web frontends.
    |
    | Examples:
    |   CORS_ALLOWED_ORIGINS=https://myapp.com,https://staging.myapp.com
    |   CORS_ALLOWED_ORIGINS=*   (allow all — fine for fully public APIs)
    |
    */

    'paths' => ['api/*'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => array_filter(
        explode(',', env('CORS_ALLOWED_ORIGINS', '*'))
    ),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'X-Cart-Token', 'Idempotency-Key', 'X-Idempotency-Key'],

    'exposed_headers' => [],

    'max_age' => 3600,

    'supports_credentials' => true,

];
