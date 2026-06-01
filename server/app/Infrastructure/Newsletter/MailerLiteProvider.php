<?php

declare(strict_types=1);

namespace App\Infrastructure\Newsletter;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * MailerLite API Provider.
 *
 * Uses the MailerLite API v2 to manage subscribers.
 */
final readonly class MailerLiteProvider implements NewsletterProvider
{
    private const string API_URL = 'https://connect.mailerlite.com/api/subscribers';

    public function __construct(
        private string $apiKey,
        private string $groupId,
    ) {}

    public function isConfigured(): bool
    {
        return $this->apiKey !== '' && $this->groupId !== '';
    }

    public function subscribe(string $email, array $attributes = []): void
    {
        if (! $this->isConfigured()) {
            return;
        }

        $payload = array_merge([
            'email' => $email,
            'status' => 'active',
            'groups' => [$this->groupId],
        ], $attributes);

        Http::withToken($this->apiKey)
            ->timeout(5)
            ->post(self::API_URL, $payload)
            ->onError(function ($response) use ($email): void {
                Log::error('MailerLite: Failed to subscribe user', [
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

        Http::withToken($this->apiKey)
            ->timeout(5)
            ->put(self::API_URL.'/'.urlencode($email), [
                'status' => 'unsubscribed',
            ])
            ->onError(function ($response) use ($email): void {
                Log::error('MailerLite: Failed to unsubscribe user', [
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

        Http::withToken($this->apiKey)
            ->timeout(5)
            ->delete(self::API_URL.'/'.urlencode($email))
            ->onError(function ($response) use ($email): void {
                Log::error('MailerLite: Failed to delete user', [
                    'email' => $email,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            });
    }
}
