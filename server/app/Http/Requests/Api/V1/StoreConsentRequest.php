<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreConsentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'analytics' => ['required', 'boolean'],
            'marketing' => ['required', 'boolean'],
            'functional' => ['required', 'boolean'],
            'session_id' => ['nullable', 'string', 'max:64'],
            'consent_version' => ['nullable', 'string', 'max:16'],
        ];
    }
}
