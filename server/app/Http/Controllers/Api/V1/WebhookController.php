<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Infrastructure\Payments\P24\P24SignatureService;
use App\Infrastructure\Payments\PayU\PayUWebhookVerifier;
use App\Jobs\ProcessPaymentWebhook;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebhookController extends ApiController
{
    public function payu(Request $request, PayUWebhookVerifier $verifier): JsonResponse
    {
        $body = $request->getContent();
        $signatureHeader = $request->header('OpenPayu-Signature', '');

        // Quick signature verification before queuing (PayU requires 200 within 10s)
        abort_unless($verifier->verify($body, (string) $signatureHeader), 400, 'Invalid signature');

        $payload = json_decode($body, true) ?? [];

        dispatch(new ProcessPaymentWebhook('payu', $payload, $body, (string) $signatureHeader));

        return $this->ok(['message' => 'OK']);
    }

    public function p24(Request $request, P24SignatureService $verifier): JsonResponse
    {
        $payload = $request->all();
        $body = $request->getContent();

        abort_unless($verifier->verifyWebhook($payload), 400, 'Invalid signature');

        $signature = (string) ($payload['sign'] ?? '');

        dispatch(new ProcessPaymentWebhook('p24', $payload, $body, $signature));

        return $this->ok(['message' => 'OK']);
    }
}
