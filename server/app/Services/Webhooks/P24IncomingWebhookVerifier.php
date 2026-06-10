<?php

declare(strict_types=1);

namespace App\Services\Webhooks;

use App\Infrastructure\Payments\P24\P24SignatureService;
use App\Interfaces\IncomingWebhookVerifierInterface;
use Illuminate\Http\Request;

final readonly class P24IncomingWebhookVerifier implements IncomingWebhookVerifierInterface
{
    public function __construct(
        private P24SignatureService $verifier,
    ) {}

    public function verify(Request $request): WebhookVerificationResult
    {
        /** @var array<string, mixed> $payload */
        $payload = $request->all();

        if (! $this->verifier->verifyWebhook($payload)) {
            return WebhookVerificationResult::invalid('Invalid signature', 400);
        }

        return WebhookVerificationResult::valid($payload);
    }
}
