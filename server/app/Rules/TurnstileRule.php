<?php

declare(strict_types=1);

namespace App\Rules;

use App\Services\TurnstileService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class TurnstileRule implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Skip in development when no secret key is configured
        if (empty(config('services.cloudflare.turnstile_secret'))) {
            return;
        }

        if (empty($value)) {
            $fail('Please complete the security challenge.');

            return;
        }

        $verified = resolve(TurnstileService::class)->verify((string) $value, request()->ip());

        if (! $verified) {
            $fail('Security challenge failed. Please try again.');
        }
    }
}
