<?php

declare(strict_types=1);

namespace App\Rules;

use App\Services\OutboundWebhookPolicy;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

final class WebhookTargetUrlRule implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            $fail('The :attribute must be a string.');

            return;
        }

        $violation = OutboundWebhookPolicy::violationFor($value);

        if ($violation !== null) {
            $fail($violation);
        }
    }
}
