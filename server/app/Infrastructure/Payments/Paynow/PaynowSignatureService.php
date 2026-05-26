<?php

declare(strict_types=1);

namespace App\Infrastructure\Payments\Paynow;

class PaynowSignatureService
{
    /**
     * @param  array<string, mixed>  $parameters
     */
    public function signRequest(string $idempotencyKey, string $body = '', array $parameters = []): string
    {
        return $this->hmac($this->requestPayload($idempotencyKey, $body, $parameters));
    }

    public function signNotification(string $body): string
    {
        return $this->hmac($body);
    }

    public function verifyNotification(string $body, string $signature): bool
    {
        if ($signature === '') {
            return false;
        }

        return hash_equals($this->signNotification($body), $signature);
    }

    /**
     * @param  array<string, mixed>  $parameters
     */
    public function requestPayload(string $idempotencyKey, string $body = '', array $parameters = []): string
    {
        ksort($parameters);

        return json_encode([
            'headers' => [
                'Api-Key' => (string) config('services.paynow.api_key'),
                'Idempotency-Key' => $idempotencyKey,
            ],
            'parameters' => (object) $parameters,
            'body' => $body,
        ], JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    }

    private function hmac(string $payload): string
    {
        return base64_encode(hash_hmac(
            'sha256',
            $payload,
            (string) config('services.paynow.signature_key'),
            true,
        ));
    }
}
