<?php

declare(strict_types=1);

namespace App\Infrastructure\Payments\Paynow;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class PaynowClient
{
    public function __construct(
        private readonly PaynowSignatureService $signatureService
    ) {}

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function createPayment(array $data, string $idempotencyKey): array
    {
        $body = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);

        $response = $this->client($idempotencyKey, $body)
            ->withBody($body, 'application/json')
            ->post($this->baseUrl().'/v3/payments');

        if (! $response->successful()) {
            throw new RuntimeException('Paynow payment creation failed: '.$response->body());
        }

        return $response->json() ?? [];
    }

    /**
     * @return array<string, mixed>
     */
    public function getPaymentStatus(string $paymentId, string $idempotencyKey): array
    {
        $response = $this->client($idempotencyKey)
            ->get($this->baseUrl().'/v3/payments/'.$paymentId.'/status');

        if (! $response->successful()) {
            throw new RuntimeException('Paynow status check failed: '.$response->body());
        }

        return $response->json() ?? [];
    }

    private function client(string $idempotencyKey, string $body = ''): PendingRequest
    {
        return Http::acceptJson()
            ->withHeaders([
                'Api-Key' => (string) config('services.paynow.api_key'),
                'Idempotency-Key' => $idempotencyKey,
                'Signature' => $this->signatureService->signRequest($idempotencyKey, $body),
            ]);
    }

    private function baseUrl(): string
    {
        return mb_rtrim((string) config('services.paynow.base_url'), '/');
    }
}
