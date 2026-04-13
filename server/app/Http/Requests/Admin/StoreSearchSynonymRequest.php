<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreSearchSynonymRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'term' => ['required', 'string', 'max:255'],
            'synonyms' => ['required', 'array', 'min:1'],
            'synonyms.*' => ['required', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        // Parse synonyms from newline-delimited textarea if sent as string
        if ($this->has('synonyms_text') && ! $this->has('synonyms')) {
            $lines = array_filter(
                array_map(trim(...), explode("\n", (string) $this->input('synonyms_text'))),
                fn (string $line): bool => $line !== '',
            );
            $this->merge(['synonyms' => array_values($lines)]);
        }
    }
}
