<?php

declare(strict_types=1);

namespace App\Infrastructure\Payments\PayU;

class PayUWebhookVerifier
{
    /**
     * Verify PayU webhook signature from OpenPayu-Signature header.
     */
    public function verify(string $body, string $signatureHeader): bool
    {
        $signature = $this->extractSignature($signatureHeader);

        if ($signature === null) {
            return false;
        }

        $expected = md5($body.config('services.payu.md5_key'));

        return hash_equals($expected, $signature);
    }

    private function extractSignature(string $header): ?string
    {
        // Header format: "sender=checkout;signature=abc123;algorithm=MD5;..."
        foreach (explode(';', $header) as $part) {
            [$key, $value] = array_pad(explode('=', $part, 2), 2, '');
            if (mb_trim($key) === 'signature') {
                return mb_trim($value) ?: null;
            }
        }

        return null;
    }
}
