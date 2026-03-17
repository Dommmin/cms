<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Infrastructure\Payments\PayU\PayUWebhookVerifier;
use App\Jobs\ProcessPaymentWebhook;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebhookController extends Controller
{
    public function payu(Request $request, PayUWebhookVerifier $verifier): JsonResponse
    {
        $body = $request->getContent();
        $signatureHeader = $request->header('OpenPayu-Signature', '');

        // Quick signature verification before queuing (PayU requires 200 within 10s)
        if (! $verifier->verify($body, (string) $signatureHeader)) {
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        $payload = json_decode($body, true) ?? [];

        ProcessPaymentWebhook::dispatch('payu', $payload, $body, (string) $signatureHeader);

        return response()->json(['message' => 'OK']);
    }

    public function p24(Request $request): JsonResponse
    {
        $payload = $request->all();
        $body = $request->getContent();
        $signature = (string) ($payload['sign'] ?? '');

        ProcessPaymentWebhook::dispatch('p24', $payload, $body, $signature);

        return response()->json(['message' => 'OK']);
    }
}
