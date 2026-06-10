<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Webhook;
use App\Models\WebhookDelivery;
use App\Services\Webhooks\OutboundWebhookDeliveryService;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Attributes\Backoff;
use Illuminate\Queue\Attributes\Tries;

#[Backoff(60)]
#[Tries(3)]
final class DeliverWebhookJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly Webhook $webhook,
        public readonly string $event,
        public readonly array $payload,
    ) {}

    public function handle(OutboundWebhookDeliveryService $deliveryService): void
    {
        try {
            $result = $deliveryService->deliver($this->webhook, $this->event, $this->payload);

            WebhookDelivery::query()->create([
                'webhook_id' => $this->webhook->id,
                'event' => $this->event,
                'payload' => $this->payload,
                'status' => $result->status,
                'attempt' => $this->attempts(),
                'response_status' => $result->responseStatus,
                'response_body' => $result->responseBody,
                'duration_ms' => $result->durationMs,
                'delivered_at' => now(),
            ]);

            if ($result->successful()) {
                $this->webhook->update([
                    'last_triggered_at' => now(),
                    'failure_count' => 0,
                ]);
            } else {
                Webhook::query()->where('id', $this->webhook->id)->increment('failure_count');
                $this->fail($result->responseStatus !== null
                    ? 'HTTP '.$result->responseStatus
                    : $result->responseBody);
            }
        } catch (Exception $exception) {
            Webhook::query()->where('id', $this->webhook->id)->increment('failure_count');
            throw $exception;
        }
    }
}
