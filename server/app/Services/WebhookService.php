<?php

declare(strict_types=1);

namespace App\Services;

use App\Jobs\DeliverWebhookJob;
use App\Models\Webhook;

final class WebhookService
{
    public function dispatch(string $event, array $payload): void
    {
        $webhooks = Webhook::query()
            ->where('is_active', true)
            ->whereJsonContains('events', $event)
            ->get();

        foreach ($webhooks as $webhook) {
            dispatch(new DeliverWebhookJob($webhook, $event, $payload))->onQueue('webhooks');
        }
    }
}
