<?php

declare(strict_types=1);

namespace App\Services\Webhooks;

use App\Infrastructure\Payments\PayU\PayUWebhookVerifier;
use App\Interfaces\IncomingWebhookVerifierInterface;
use Illuminate\Http\Request;
use JsonException;

final readonly class PayUIncomingWebhookVerifier implements IncomingWebhookVerifierInterface
{
    public function __construct(
        private PayUWebhookVerifier $verifier,
    ) {}

    public function verify(Request $request): WebhookVerificationResult
    {
        $body = $request->getContent();
        $signatureHeader = (string) $request->header('OpenPayu-Signature', '');

        if (! $this->verifier->verify($body, $signatureHeader)) {
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
