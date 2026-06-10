<?php

declare(strict_types=1);

namespace App\Services\Webhooks;

use App\Interfaces\IncomingWebhookVerifierInterface;
use Illuminate\Http\Request;
use JsonException;
use Stripe\Exception\SignatureVerificationException;
use Stripe\WebhookSignature;

final class StripeIncomingWebhookVerifier implements IncomingWebhookVerifierInterface
{
    public function verify(Request $request): WebhookVerificationResult
    {
        $payload = $request->getContent();
        $signature = (string) $request->header('Stripe-Signature', '');
        $secret = (string) (config('cashier.webhook.secret') ?: config('services.stripe.webhook_secret'));

        if ($secret === '') {
            return WebhookVerificationResult::invalid('Stripe webhook secret is not configured', 500);
        }

        try {
            WebhookSignature::verifyHeader(
                $payload,
                $signature,
                $secret,
                (int) config('cashier.webhook.tolerance', 300),
            );
        } catch (SignatureVerificationException) {
            return WebhookVerificationResult::invalid('Invalid signature', 400);
        }

        try {
            /** @var array<string, mixed> $decoded */
            $decoded = json_decode($payload, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            return WebhookVerificationResult::invalid('Invalid payload', 400);
        }

        return WebhookVerificationResult::valid($decoded);
    }
}
