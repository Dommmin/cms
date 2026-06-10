<?php

declare(strict_types=1);

namespace App\Services\Webhooks;

use App\Models\Webhook;
use App\Services\OutboundWebhookPolicy;
use Illuminate\Support\Facades\Http;
use JsonException;
use RuntimeException;

final class OutboundWebhookDeliveryService
{
    public function deliver(Webhook $webhook, string $event, array $payload): OutboundWebhookDeliveryResult
    {
        $urlViolation = OutboundWebhookPolicy::violationFor($webhook->url);

        if ($urlViolation !== null) {
            return OutboundWebhookDeliveryResult::failed(null, $urlViolation, 0);
        }

        $requestBody = [
            'event' => $event,
            'timestamp' => now()->toIso8601String(),
            'data' => $payload,
        ];

        try {
            $body = json_encode($requestBody, JSON_THROW_ON_ERROR);
        } catch (JsonException $jsonException) {
            throw new RuntimeException('Unable to encode webhook payload.', $jsonException->getCode(), previous: $jsonException);
        }

        $signature = hash_hmac('sha256', $body, $webhook->secret);
        $start = microtime(true);

        $response = Http::connectTimeout(3)
            ->timeout(10)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'User-Agent' => 'CMS-Webhook/1.0',
                'X-Webhook-Event' => $event,
                'X-Webhook-Signature' => 'sha256='.$signature,
            ])
            ->post($webhook->url, $requestBody);

        $duration = (int) ((microtime(true) - $start) * 1000);
        $responseBody = mb_substr($response->body(), 0, 1000);

        if ($response->successful()) {
            return OutboundWebhookDeliveryResult::success($response->status(), $responseBody, $duration);
        }

        return OutboundWebhookDeliveryResult::failed($response->status(), $responseBody, $duration);
    }
}
