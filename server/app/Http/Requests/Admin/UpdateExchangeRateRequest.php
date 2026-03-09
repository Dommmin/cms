<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExchangeRateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'currency_id' => ['required', 'exists:currencies,id'],
            'rate' => ['required', 'numeric', 'min:0'],
            'source' => ['nullable', 'string', 'max:255'],
            'fetched_at' => ['required', 'date'],
        ];
    }
}
