<?php

declare(strict_types=1);

namespace App\Services\Webhooks;

use App\Interfaces\IncomingWebhookVerifierInterface;
use Illuminate\Http\Request;
use JsonException;

final class MailerLiteIncomingWebhookVerifier implements IncomingWebhookVerifierInterface
{
    public function verify(Request $request): WebhookVerificationResult
    {
        $signature = $request->header('X-MailerLite-Signature');

        if (! $signature) {
            return WebhookVerificationResult::invalid('Signature missing.', 401);
        }

        $secret = config('services.mailerlite.webhook_secret') ?: config('services.mailerlite.api_key');

        if (! $secret) {
            return WebhookVerificationResult::invalid('Verification secret not configured.', 500);
        }

        $body = $request->getContent();
        $expectedSignature = base64_encode(hash_hmac('sha256', $body, (string) $secret, true));

        if (! hash_equals($expectedSignature, $signature)) {
            return WebhookVerificationResult::invalid('Invalid signature.', 401);
        }

        try {
            /** @var array<string, mixed> $payload */
            $payload = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            return WebhookVerificationResult::invalid('Invalid payload.', 400);
        }

        return WebhookVerificationResult::valid($payload);
    }
}
