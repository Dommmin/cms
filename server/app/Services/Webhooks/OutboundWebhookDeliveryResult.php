<?php

declare(strict_types=1);

namespace App\Services\Webhooks;

final readonly class OutboundWebhookDeliveryResult
{
    private function __construct(
        public string $status,
        public ?int $responseStatus,
        public string $responseBody,
        public int $durationMs,
    ) {}

    public static function success(int $responseStatus, string $responseBody, int $durationMs): self
    {
        return new self('success', $responseStatus, $responseBody, $durationMs);
    }

    public static function failed(?int $responseStatus, string $responseBody, int $durationMs): self
    {
        return new self('failed', $responseStatus, $responseBody, $durationMs);
    }

    public function successful(): bool
    {
        return $this->status === 'success';
    }
}
