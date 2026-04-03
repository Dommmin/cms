<?php

declare(strict_types=1);

namespace App\Infrastructure\Payments\P24;

class P24SignatureService
{
    /**
     * Sign a transaction registration request.
     * sha256(merchantId|posId|sessionId|amount|currency|crc)
     */
    public function signTransaction(array $params): string
    {
        $data = json_encode([
            'merchantId' => $params['merchantId'],
            'posId' => $params['posId'],
            'sessionId' => $params['sessionId'],
            'amount' => $params['amount'],
            'currency' => $params['currency'],
            'crc' => config('services.p24.crc'),
        ], JSON_UNESCAPED_UNICODE);

        return hash('sha256', $data);
    }

    /**
     * Sign a transaction verification request.
     * sha256({merchantId, posId, sessionId, orderId, amount, currency, crc})
     */
    public function signVerify(array $params): string
    {
        $data = json_encode([
            'merchantId' => $params['merchantId'],
            'posId' => $params['posId'],
            'sessionId' => $params['sessionId'],
            'orderId' => $params['orderId'],
            'amount' => $params['amount'],
            'currency' => $params['currency'],
            'crc' => config('services.p24.crc'),
        ], JSON_UNESCAPED_UNICODE);

        return hash('sha256', $data);
    }

    public function verify(string $expected, string $computed): bool
    {
        return hash_equals($expected, $computed);
    }

    public function verifyWebhook(array $payload): bool
    {
        $sign = $payload['sign'] ?? null;

        if (! $sign) {
            return false;
        }

        unset($payload['sign']);

        ksort($payload);

        $parts = [];
        foreach ($payload as $key => $value) {
            $parts[] = $key.'='.$value;
        }

        $parts[] = 'crc='.config('services.p24.crc');
        $string = implode('&', $parts);

        $computed = hash('sha256', $string);

        return hash_equals($sign, $computed);
    }
}
