<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use App\Rules\TurnstileRule;

class StoreGuestReturnRequestRequest extends StoreReturnRequestRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'reference_number' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email:rfc', 'max:255'],
            'cf_turnstile_response' => [
                config('services.cloudflare.turnstile_secret') ? 'required' : 'nullable',
                'string',
                new TurnstileRule(),
            ],
            ...parent::rules(),
        ];
    }
}
