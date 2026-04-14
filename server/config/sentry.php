<?php

declare(strict_types=1);

return [
    'dsn' => env('GLITCHTIP_DSN', env('SENTRY_LARAVEL_DSN')),

    'release' => env('APP_VERSION', env('SENTRY_RELEASE')),

    'environment' => env('APP_ENV', 'production'),

    'sample_rate' => (float) env('GLITCHTIP_SAMPLE_RATE', env('SENTRY_SAMPLE_RATE', 1.0)),

    'traces_sample_rate' => (float) env('GLITCHTIP_TRACES_SAMPLE_RATE', env('SENTRY_TRACES_SAMPLE_RATE', 0.2)),

    'profiles_sample_rate' => (float) env('GLITCHTIP_PROFILES_SAMPLE_RATE', env('SENTRY_PROFILES_SAMPLE_RATE', 0.2)),

    'breadcrumbs' => [
        'logs' => true,
        'cache' => true,
        'http' => true,
        'db' => true,
        'queue' => true,
    ],

    'error_types' => E_ALL & ~E_DEPRECATED & ~E_NOTICE,

    'integrations' => [],

    'send_default_pii' => env('GLITCHTIP_SEND_DEFAULT_PII', env('SENTRY_SEND_DEFAULT_PII', false)),

    'ignore_exceptions' => [],

    'ignore_transactions' => [],

    'controllers_base_namespace' => 'App\\Http\\Controllers',
];
