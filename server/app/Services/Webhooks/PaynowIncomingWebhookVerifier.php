<?php

declare(strict_types=1);

namespace App\Services\Webhooks;

use App\Infrastructure\Payments\Paynow\PaynowSignatureService;
use App\Interfaces\IncomingWebhookVerifierInterface;
use Illuminate\Http\Request;
use JsonException;

final readonly class PaynowIncomingWebhookVerifier implements IncomingWebhookVerifierInterface
{
    public function __construct(
        private PaynowSignatureService $verifier,
    ) {}

    public function verify(Request $request): WebhookVerificationResult
    {
        $body = $request->getContent();
        $signature = (string) $request->header('Signature', '');

        if (! $this->verifier->verifyNotification($body, $signature)) {
            return WebhookVerificationResult::invalid('Invalid signature', 400);
        }

        try {
            /** @var array<string, mixed> $payload */
            $payload = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            return WebhookVerificationResult::invalid('Invalid payload', 400);
        }

        return WebhookVerificationResult::valid($payload);
    }
}
