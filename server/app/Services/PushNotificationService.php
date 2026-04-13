<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\PushSubscription;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

final class PushNotificationService
{
    private ?WebPush $webPush = null;

    public function __construct(
        private readonly ?string $publicKey,
        private readonly ?string $privateKey
    ) {}

    public static function generateVapidKeys(): array
    {
        $vapid = WebPush::createVapidKeys();

        return [
            'public_key' => $vapid['publicKey'],
            'private_key' => $vapid['privateKey'],
        ];
    }

    public function subscribe(User $user, array $subscriptionData): PushSubscription
    {
        // check if subscription already exists
        $existing = PushSubscription::query()
            ->where('endpoint', $subscriptionData['endpoint'])
            ->first();

        if ($existing) {
            $existing->update([
                'user_id' => $user->id,
                'public_key' => $subscriptionData['keys']['p256dh'] ?? null,
                'auth_token' => $subscriptionData['keys']['auth'] ?? null,
                'user_agent' => request()->userAgent(),
                'is_active' => true,
            ]);

            return $existing;
        }

        return PushSubscription::query()->create([
            'user_id' => $user->id,
            'endpoint' => $subscriptionData['endpoint'],
            'public_key' => $subscriptionData['keys']['p256dh'] ?? null,
            'auth_token' => $subscriptionData['keys']['auth'] ?? null,
            'content_encoding' => 'aesgcm',
            'user_agent' => request()->userAgent(),
            'is_active' => true,
        ]);
    }

    public function unsubscribe(string $endpoint): void
    {
        PushSubscription::query()
            ->where('endpoint', $endpoint)
            ->delete();
    }

    public function sendToUser(User $user, string $title, string $body, array $data = []): int
    {
        $subscriptions = PushSubscription::query()
            ->where('user_id', $user->id)
            ->active()
            ->get();

        $sentCount = 0;

        foreach ($subscriptions as $subscription) {
            if ($this->send($subscription, $title, $body, $data)) {
                $sentCount++;
            }
        }

        return $sentCount;
    }

    public function sendToAll(string $title, string $body, array $data = []): int
    {
        $subscriptions = PushSubscription::query()->active()->get();

        $sentCount = 0;

        foreach ($subscriptions as $subscription) {
            if ($this->send($subscription, $title, $body, $data)) {
                $sentCount++;
            }
        }

        return $sentCount;
    }

    public function send(PushSubscription $subscription, string $title, string $body, array $data = []): bool
    {
        if (! $this->publicKey || ! $this->privateKey) {
            Log::warning('Push notifications not configured - VAPID keys missing');

            return false;
        }

        try {
            $webPush = $this->getWebPush();

            $pushSubscription = Subscription::create([
                'endpoint' => $subscription->endpoint,
                'publicKey' => $subscription->public_key,
                'authToken' => $subscription->auth_token,
                'contentEncoding' => $subscription->content_encoding,
            ]);

            $payload = json_encode([
                'title' => $title,
                'body' => $body,
                'data' => $data,
                'icon' => $data['icon'] ?? '/icons/notification-icon.png',
                'badge' => $data['badge'] ?? '/icons/badge-icon.png',
            ]);

            $webPush->queueNotification($pushSubscription, $payload);

            foreach ($webPush->flush() as $report) {
                if ($report->isSuccess()) {
                    return true;
                }

                if ($report->isSubscriptionExpired()) {
                    $subscription->delete();
                }
            }
        } catch (Exception $exception) {
            Log::error('Push notification failed', [
                'subscription_id' => $subscription->id,
                'error' => $exception->getMessage(),
            ]);
        }

        return false;
    }

    private function getWebPush(): WebPush
    {
        if (! $this->webPush instanceof WebPush) {
            $this->webPush = new WebPush([
                'VAPID' => [
                    'subject' => config('app.url'),
                    'publicKey' => $this->publicKey,
                    'privateKey' => $this->privateKey,
                ],
            ]);
        }

        return $this->webPush;
    }
}
