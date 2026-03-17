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
}
