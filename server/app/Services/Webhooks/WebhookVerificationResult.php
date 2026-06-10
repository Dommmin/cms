<?php

declare(strict_types=1);

namespace App\Services\Webhooks;

final readonly class WebhookVerificationResult
{
    /**
     * @param  array<string, mixed>  $payload
     */
    private function __construct(
        public bool $valid,
        public array $payload,
        public ?string $message,
        public int $status,
    ) {}

    /**
     * @param  array<string, mixed>  $payload
     */
    public static function valid(array $payload): self
    {
        return new self(true, $payload, null, 200);
    }

    public static function invalid(string $message, int $status): self
    {
        return new self(false, [], $message, $status);
    }
}
