<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Services\PaymentGatewayManager;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessPaymentWebhook implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 10;

    /**
     * @param  array<string, mixed>  $payload
     */
    public function __construct(
        private readonly string $provider,
        private readonly array $payload,
        private readonly string $rawBody,
        private readonly string $signature
    ) {}

    public function handle(PaymentGatewayManager $gatewayManager): void
    {
        $providerEnum = \App\Enums\PaymentProviderEnum::from($this->provider);
        $gateway = $gatewayManager->driver($providerEnum);
        $gateway->handleWebhook($this->payload);
    }
}
