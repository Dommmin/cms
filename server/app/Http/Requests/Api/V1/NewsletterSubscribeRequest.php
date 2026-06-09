<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use App\Rules\TurnstileRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class NewsletterSubscribeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255'],
            'first_name' => ['nullable', 'string', 'max:255'],
            'cf_turnstile_response' => [
                config('services.cloudflare.turnstile_secret') ? 'required' : 'nullable',
                'string',
                new TurnstileRule(),
            ],
        ];
    }
}
