<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Webhook;
use App\Models\WebhookDelivery;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;

final class DeliverWebhookJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        public readonly Webhook $webhook,
        public readonly string $event,
        public readonly array $payload,
    ) {}

    public function handle(): void
    {
        $body = json_encode([
            'event' => $this->event,
            'timestamp' => now()->toIso8601String(),
            'data' => $this->payload,
        ]);

        $signature = hash_hmac('sha256', $body, $this->webhook->secret);

        $start = microtime(true);

        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'X-Webhook-Event' => $this->event,
                    'X-Webhook-Signature' => 'sha256='.$signature,
                ])
                ->post($this->webhook->url, json_decode($body, true));

            $duration = (int) ((microtime(true) - $start) * 1000);
            $status = $response->successful() ? 'success' : 'failed';

            WebhookDelivery::query()->create([
                'webhook_id' => $this->webhook->id,
                'event' => $this->event,
                'payload' => $this->payload,
                'status' => $status,
                'attempt' => $this->attempts(),
                'response_status' => $response->status(),
                'response_body' => mb_substr($response->body(), 0, 1000),
                'duration_ms' => $duration,
                'delivered_at' => now(),
            ]);

            if ($status === 'success') {
                $this->webhook->update([
                    'last_triggered_at' => now(),
                    'failure_count' => 0,
                ]);
            } else {
                Webhook::query()->where('id', $this->webhook->id)->increment('failure_count');
                $this->fail('HTTP '.$response->status());
            }
        } catch (Exception $exception) {
            Webhook::query()->where('id', $this->webhook->id)->increment('failure_count');
            throw $exception;
        }
    }
}
