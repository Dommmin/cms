<?php

declare(strict_types=1);

namespace App\Infrastructure\Newsletter;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Klaviyo API Provider using v3 API.
 */
final readonly class KlaviyoProvider implements NewsletterProvider
{
    public function __construct(
        private string $apiKey,
        private string $listId,
    ) {}

    public function isConfigured(): bool
    {
        return $this->apiKey !== '' && $this->listId !== '';
    }

    public function subscribe(string $email, array $attributes = []): void
    {
        if (! $this->isConfigured()) {
            return;
        }

        $profileAttributes = [
            'email' => $email,
            'subscriptions' => [
                'email' => [
                    'marketing' => [
                        'consent' => 'SUBSCRIBED',
                    ],
                ],
            ],
        ];

        if (isset($attributes['first_name'])) {
            $profileAttributes['first_name'] = $attributes['first_name'];
        }

        if (isset($attributes['last_name'])) {
            $profileAttributes['last_name'] = $attributes['last_name'];
        }

        $payload = [
            'data' => [
                'type' => 'profile-subscription-bulk-create-job',
                'attributes' => [
                    'profiles' => [
                        'data' => [
                            [
                                'type' => 'profile',
                                'attributes' => $profileAttributes,
                            ],
                        ],
                    ],
                ],
                'relationships' => [
                    'list' => [
                        'data' => [
                            'type' => 'list',
                            'id' => $this->listId,
                        ],
                    ],
                ],
            ],
        ];

        Http::withHeaders([
            'Authorization' => 'Klaviyo-API-Key '.$this->apiKey,
            'revision' => '2024-05-15',
            'Accept' => 'application/vnd.api+json',
            'Content-Type' => 'application/vnd.api+json',
        ])
            ->timeout(5)
            ->post('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', $payload)
            ->onError(function ($response) use ($email): void {
                Log::error('Klaviyo: Failed to subscribe user', [
                    'email' => $email,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            });
    }

    public function unsubscribe(string $email): void
    {
        if (! $this->isConfigured()) {
            return;
        }

        $payload = [
            'data' => [
                'type' => 'profile-subscription-bulk-delete-job',
                'attributes' => [
                    'profiles' => [
                        'data' => [
                            [
                                'type' => 'profile',
                                'attributes' => [
                                    'email' => $email,
                                ],
                            ],
                        ],
                    ],
                ],
                'relationships' => [
                    'list' => [
                        'data' => [
                            'type' => 'list',
                            'id' => $this->listId,
                        ],
                    ],
                ],
            ],
        ];

        Http::withHeaders([
            'Authorization' => 'Klaviyo-API-Key '.$this->apiKey,
            'revision' => '2024-05-15',
            'Accept' => 'application/vnd.api+json',
            'Content-Type' => 'application/vnd.api+json',
        ])
            ->timeout(5)
            ->post('https://a.klaviyo.com/api/profile-subscription-bulk-delete-jobs/', $payload)
            ->onError(function ($response) use ($email): void {
                Log::error('Klaviyo: Failed to unsubscribe user', [
                    'email' => $email,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            });
    }

    public function delete(string $email): void
    {
        if (! $this->isConfigured()) {
            return;
        }

        // 1. Get profile ID by email
        $response = Http::withHeaders([
            'Authorization' => 'Klaviyo-API-Key '.$this->apiKey,
            'revision' => '2024-05-15',
            'Accept' => 'application/vnd.api+json',
        ])
            ->timeout(5)
            ->get('https://a.klaviyo.com/api/profiles/', [
                'filter' => 'equals(email,"'.$email.'")',
            ]);

        if ($response->failed()) {
            Log::error('Klaviyo: Failed to search profile for deletion', [
                'email' => $email,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return;
        }

        $data = $response->json('data');
        if (empty($data)) {
            return;
        }

        $profileId = $data[0]['id'] ?? null;
        if (! $profileId) {
            return;
        }

        // 2. Delete the profile
        Http::withHeaders([
            'Authorization' => 'Klaviyo-API-Key '.$this->apiKey,
            'revision' => '2024-05-15',
            'Accept' => 'application/vnd.api+json',
        ])
            ->timeout(5)
            ->delete(sprintf('https://a.klaviyo.com/api/profiles/%s/', $profileId))
            ->onError(function ($response) use ($email): void {
                Log::error('Klaviyo: Failed to delete profile', [
                    'email' => $email,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            });
    }
}
