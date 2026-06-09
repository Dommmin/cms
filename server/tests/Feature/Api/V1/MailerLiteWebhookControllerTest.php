<?php

declare(strict_types=1);

use App\Models\NewsletterSubscriber;
use Illuminate\Support\Facades\Config;

beforeEach(function (): void {
    Config::set('services.mailerlite.webhook_secret', 'test-webhook-secret');
});

it('returns 401 if signature is missing', function (): void {
    $payload = [
        'events' => [
            [
                'type' => 'subscriber.unsubscribed',
                'data' => [
                    'subscriber' => [
                        'email' => 'test@example.com',
                    ],
                ],
            ],
        ],
    ];

    $this->postJson(route('api.v1.newsletter.webhooks.mailerlite'), $payload)
        ->assertStatus(401)
        ->assertJson(['message' => 'Signature missing.']);
});

it('returns 401 if signature is invalid', function (): void {
    $payload = [
        'events' => [
            [
                'type' => 'subscriber.unsubscribed',
                'data' => [
                    'subscriber' => [
                        'email' => 'test@example.com',
                    ],
                ],
            ],
        ],
    ];

    $this->postJson(route('api.v1.newsletter.webhooks.mailerlite'), $payload, [
        'X-MailerLite-Signature' => 'invalid-signature',
    ])
        ->assertStatus(401)
        ->assertJson(['message' => 'Invalid signature.']);
});

it('processes unsubscribes successfully with valid signature', function (): void {
    $subscriber = NewsletterSubscriber::query()->create([
        'email' => 'test@example.com',
        'token' => 'test-token-1',
        'consent_given' => true,
        'is_active' => true,
    ]);

    $payload = [
        'events' => [
            [
                'type' => 'subscriber.unsubscribed',
                'data' => [
                    'subscriber' => [
                        'email' => 'test@example.com',
                    ],
                ],
            ],
        ],
    ];

    $jsonPayload = json_encode($payload);
    $signature = base64_encode(hash_hmac('sha256', $jsonPayload, 'test-webhook-secret', true));

    $this->postJson(route('api.v1.newsletter.webhooks.mailerlite'), $payload, [
        'X-MailerLite-Signature' => $signature,
    ])
        ->assertOk();

    expect($subscriber->fresh()->is_active)->toBeFalse();
});

it('processes deletions successfully with valid signature', function (): void {
    $subscriber = NewsletterSubscriber::query()->create([
        'email' => 'test@example.com',
        'token' => 'test-token-2',
        'consent_given' => true,
        'is_active' => true,
    ]);

    $payload = [
        'events' => [
            [
                'type' => 'subscriber.deleted',
                'data' => [
                    'subscriber' => [
                        'email' => 'test@example.com',
                    ],
                ],
            ],
        ],
    ];

    $jsonPayload = json_encode($payload);
    $signature = base64_encode(hash_hmac('sha256', $jsonPayload, 'test-webhook-secret', true));

    $this->postJson(route('api.v1.newsletter.webhooks.mailerlite'), $payload, [
        'X-MailerLite-Signature' => $signature,
    ])
        ->assertOk();

    expect(NewsletterSubscriber::query()->where('email', 'test@example.com')->exists())->toBeFalse();
});
