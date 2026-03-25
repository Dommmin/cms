<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateThemeRequest extends FormRequest
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $theme = $this->route('theme');

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:themes,slug,'.$theme?->id],
            'description' => ['nullable', 'string'],
            'tokens' => ['nullable', 'array'],
            'tokens.*' => ['string', 'max:100'],
            'settings' => ['nullable', 'array'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $tokens = collect((array) $this->input('tokens', []))
            ->mapWithKeys(fn (mixed $value, mixed $key): array => [mb_trim((string) $key) => is_string($value) ? mb_trim($value) : ''])
            ->filter(fn (string $value): bool => $value !== '')
            ->all();

        $this->merge([
            'tokens' => $tokens !== [] ? $tokens : null,
        ]);
    }
}
