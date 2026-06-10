<?php

declare(strict_types=1);

namespace App\Interfaces;

use App\Services\Webhooks\WebhookVerificationResult;
use Illuminate\Http\Request;

interface IncomingWebhookVerifierInterface
{
    public function verify(Request $request): WebhookVerificationResult;
}
