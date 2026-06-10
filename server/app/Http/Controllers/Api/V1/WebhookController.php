<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Jobs\ProcessPaymentWebhook;
use App\Services\Webhooks\IncomingWebhookHandler;
use App\Services\Webhooks\P24IncomingWebhookVerifier;
use App\Services\Webhooks\PaynowIncomingWebhookVerifier;
use App\Services\Webhooks\PayUIncomingWebhookVerifier;
use App\Services\Webhooks\StripeIncomingWebhookVerifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebhookController extends ApiController
{
    public function payu(
        Request $request,
        IncomingWebhookHandler $handler,
        PayUIncomingWebhookVerifier $verifier,
    ): JsonResponse {
        return $handler->handle($request, $verifier, function (array $payload): void {
            dispatch(new ProcessPaymentWebhook('payu', $payload));
        });
    }

    public function p24(
        Request $request,
        IncomingWebhookHandler $handler,
        P24IncomingWebhookVerifier $verifier,
    ): JsonResponse {
        return $handler->handle($request, $verifier, function (array $payload): void {
            dispatch(new ProcessPaymentWebhook('p24', $payload));
        });
    }

    public function paynow(
        Request $request,
        IncomingWebhookHandler $handler,
        PaynowIncomingWebhookVerifier $verifier,
    ): JsonResponse {
        return $handler->handle($request, $verifier, function (array $payload): void {
            dispatch(new ProcessPaymentWebhook('paynow', $payload));
        });
    }

    public function stripe(
        Request $request,
        IncomingWebhookHandler $handler,
        StripeIncomingWebhookVerifier $verifier,
    ): JsonResponse {
        return $handler->handle($request, $verifier, function (array $payload): void {
            dispatch(new ProcessPaymentWebhook('stripe', $payload));
        });
    }
}
