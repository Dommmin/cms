<?php

declare(strict_types=1);

namespace App\Services\Webhooks;

use App\Interfaces\IncomingWebhookVerifierInterface;
use Illuminate\Http\Request;

final class BaseLinkerIncomingWebhookVerifier implements IncomingWebhookVerifierInterface
{
    public function verify(Request $request): WebhookVerificationResult
    {
        $password = $request->header('X-BL-Pass', $request->input('bl_pass'));
        $expectedToken = config('services.baselinker.webhook_token');

        if (! $expectedToken || $password !== $expectedToken) {
            return WebhookVerificationResult::invalid('Unauthorized', 401);
        }

        /** @var array<string, mixed> $payload */
        $payload = $request->all();

        return WebhookVerificationResult::valid($payload);
    }
}
