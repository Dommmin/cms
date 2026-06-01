<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Infrastructure\Payments\P24\P24SignatureService;
use App\Infrastructure\Payments\Paynow\PaynowSignatureService;
use App\Infrastructure\Payments\PayU\PayUWebhookVerifier;
use App\Jobs\ProcessPaymentWebhook;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends ApiController
{
    public function payu(Request $request, PayUWebhookVerifier $verifier): JsonResponse
    {
        $body = $request->getContent();
        $signatureHeader = $request->header('OpenPayu-Signature', '');

        // Quick signature verification before queuing (PayU requires 200 within 10s)
        abort_unless($verifier->verify($body, (string) $signatureHeader), 400, 'Invalid signature');

        $payload = json_decode($body, true) ?? [];

        dispatch(new ProcessPaymentWebhook('payu', $payload));

        return $this->ok(['message' => 'OK']);
    }

    public function p24(Request $request, P24SignatureService $verifier): JsonResponse
    {
        $payload = $request->all();
        Log::info('P24 Webhook Raw Payload:', $payload);
        $request->getContent();

        abort_unless($verifier->verifyWebhook($payload), 400, 'Invalid signature');

        dispatch(new ProcessPaymentWebhook('p24', $payload));

        return $this->ok(['message' => 'OK']);
    }

    public function paynow(Request $request, PaynowSignatureService $verifier): JsonResponse
    {
        $body = $request->getContent();
        $signature = (string) $request->header('Signature', '');

        abort_unless($verifier->verifyNotification($body, $signature), 400, 'Invalid signature');

        $payload = json_decode($body, true) ?? [];

        dispatch(new ProcessPaymentWebhook('paynow', $payload));

        return $this->ok(['message' => 'OK']);
    }
}
