<?php

declare(strict_types=1);

namespace App\Infrastructure\Payments\P24;

use Illuminate\Support\Facades\Log;

class P24SignatureService
{
    /**
     * Sign a transaction registration request.
     * sha384(json_encode([sessionId, merchantId, amount, currency, crc]))
     */
    public function signTransaction(array $params): string
    {
        $crc = config('services.p24.crc');

        $data = json_encode([
            'sessionId' => (string) $params['sessionId'],
            'merchantId' => (int) $params['merchantId'],
            'amount' => (int) $params['amount'],
            'currency' => (string) $params['currency'],
            'crc' => (string) $crc,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $computed = hash('sha384', $data);

        Log::info('P24 Transaction Sign:', [
            'crc_length' => $crc ? mb_strlen((string) $crc) : 0,
            'crc_masked' => $crc ? mb_substr((string) $crc, 0, 4).'...'.mb_substr((string) $crc, -4) : 'empty',
            'params' => $params,
            'json_data' => $data,
            'hash' => $computed,
        ]);

        return $computed;
    }

    /**
     * Sign a transaction verification request.
     * sha384(json_encode([sessionId, orderId, amount, currency, crc]))
     */
    public function signVerify(array $params): string
    {
        $crc = config('services.p24.crc');

        $data = json_encode([
            'sessionId' => (string) $params['sessionId'],
            'orderId' => (int) $params['orderId'],
            'amount' => (int) $params['amount'],
            'currency' => (string) $params['currency'],
            'crc' => (string) $crc,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $computed = hash('sha384', $data);

        Log::info('P24 Verify Sign:', [
            'crc_length' => $crc ? mb_strlen((string) $crc) : 0,
            'crc_masked' => $crc ? mb_substr((string) $crc, 0, 4).'...'.mb_substr((string) $crc, -4) : 'empty',
            'params' => $params,
            'json_data' => $data,
            'hash' => $computed,
        ]);

        return $computed;
    }

    public function verify(string $expected, string $computed): bool
    {
        return hash_equals($expected, $computed);
    }

    /**
     * Verify incoming webhook notification signature.
     * sha384(json_encode([merchantId, posId, sessionId, amount, originAmount, currency, orderId, methodId, statement, crc]))
     */
    public function verifyWebhook(array $payload): bool
    {
        $sign = $payload['sign'] ?? null;

        if (! $sign) {
            return false;
        }

        $crc = config('services.p24.crc');

        $data = json_encode([
            'merchantId' => (int) ($payload['merchantId'] ?? 0),
            'posId' => (int) ($payload['posId'] ?? 0),
            'sessionId' => (string) ($payload['sessionId'] ?? ''),
            'amount' => (int) ($payload['amount'] ?? 0),
            'originAmount' => (int) ($payload['originAmount'] ?? 0),
            'currency' => (string) ($payload['currency'] ?? ''),
            'orderId' => (int) ($payload['orderId'] ?? 0),
            'methodId' => (int) ($payload['methodId'] ?? 0),
            'statement' => (string) ($payload['statement'] ?? ''),
            'crc' => (string) $crc,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $computed = hash('sha384', $data);

        Log::info('P24 Webhook Verification:', [
            'crc_length' => $crc ? mb_strlen((string) $crc) : 0,
            'crc_masked' => $crc ? mb_substr((string) $crc, 0, 4).'...'.mb_substr((string) $crc, -4) : 'empty',
            'payload_sign' => $sign,
            'json_data' => $data,
            'computed_sign' => $computed,
            'matches' => hash_equals($sign, $computed),
        ]);

        return hash_equals($sign, $computed);
    }
}
