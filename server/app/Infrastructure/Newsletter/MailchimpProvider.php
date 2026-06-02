<?php

declare(strict_types=1);

namespace App\Infrastructure\Newsletter;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Mailchimp API Provider using v3 API.
 */
final readonly class MailchimpProvider implements NewsletterProvider
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

        $hash = $this->getSubscriberHash($email);
        $url = $this->getBaseUrl().sprintf('/lists/%s/members/%s', $this->listId, $hash);

        $mergeFields = [];
        if (isset($attributes['first_name'])) {
            $mergeFields['FNAME'] = $attributes['first_name'];
        }

        if (isset($attributes['last_name'])) {
            $mergeFields['LNAME'] = $attributes['last_name'];
        }

        $payload = [
            'email_address' => $email,
            'status_if_new' => 'subscribed',
            'status' => 'subscribed',
        ];

        if ($mergeFields !== []) {
            $payload['merge_fields'] = $mergeFields;
        }

        Http::withBasicAuth('key', $this->apiKey)
            ->timeout(5)
            ->put($url, $payload)
            ->onError(function ($response) use ($email): void {
                Log::error('Mailchimp: Failed to subscribe user', [
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

        $hash = $this->getSubscriberHash($email);
        $url = $this->getBaseUrl().sprintf('/lists/%s/members/%s', $this->listId, $hash);

        Http::withBasicAuth('key', $this->apiKey)
            ->timeout(5)
            ->put($url, [
                'email_address' => $email,
                'status' => 'unsubscribed',
            ])
            ->onError(function ($response) use ($email): void {
                Log::error('Mailchimp: Failed to unsubscribe user', [
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

        $hash = $this->getSubscriberHash($email);
        $url = $this->getBaseUrl().sprintf('/lists/%s/members/%s', $this->listId, $hash);

        Http::withBasicAuth('key', $this->apiKey)
            ->timeout(5)
            ->delete($url)
            ->onError(function ($response) use ($email): void {
                Log::error('Mailchimp: Failed to delete user', [
                    'email' => $email,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            });
    }

    private function getBaseUrl(): string
    {
        $dc = 'us1';
        if (str_contains($this->apiKey, '-')) {
            $parts = explode('-', $this->apiKey);
            $dc = end($parts);
        }

        return sprintf('https://%s.api.mailchimp.com/3.0', $dc);
    }

    private function getSubscriberHash(string $email): string
    {
        return md5(mb_strtolower(mb_trim($email)));
    }
}
