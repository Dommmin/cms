<?php

declare(strict_types=1);

return [
    'headers' => [
        'x_content_type_options' => 'nosniff',
        'x_frame_options' => 'SAMEORIGIN',
        'referrer_policy' => 'strict-origin-when-cross-origin',
        'permissions_policy' => 'camera=(), microphone=(), geolocation=(self)',
        'cross_origin_opener_policy' => 'same-origin',
        'x_permitted_cross_domain_policies' => 'none',
        'strict_transport_security' => 'max-age=31536000; includeSubDomains',
    ],

    'outbound_webhooks' => [
        'require_https' => env('WEBHOOK_REQUIRE_HTTPS', true),
        'allow_local_targets' => env(
            'WEBHOOK_ALLOW_LOCAL_TARGETS',
            in_array((string) env('APP_ENV', 'production'), ['local', 'testing'], true)
        ),
        'allowed_local_hosts' => [
            'localhost',
            '127.0.0.1',
            '::1',
            'nginx',
            'node',
            'php',
        ],
        'blocked_host_suffixes' => [
            '.localhost',
            '.local',
            '.internal',
        ],
    ],
];
