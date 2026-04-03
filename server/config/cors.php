<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | allowed_origins: NEVER use '*' in production!
    |
    | SECURITY: For production, always set CORS_ALLOWED_ORIGINS explicitly:
    |   CORS_ALLOWED_ORIGINS=https://myapp.com,https://www.myapp.com
    |
    | Mobile apps (iOS/Android) are not subject to CORS restrictions, so this
    | config applies primarily to web frontends.
    |
    | For development, you can use '*' but this MUST be changed before production.
    |
    */

    'paths' => ['api/*'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => array_filter(
        explode(',', (string) env('CORS_ALLOWED_ORIGINS', ''))
    ),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'X-Cart-Token', 'Idempotency-Key', 'X-Idempotency-Key'],

    'exposed_headers' => [],

    'max_age' => 3600,

    'supports_credentials' => true,

];
