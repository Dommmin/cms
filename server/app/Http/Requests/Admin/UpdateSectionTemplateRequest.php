<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSectionTemplateRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'section_type' => ['required', 'string', 'max:100'],
            'variant' => ['nullable', 'string', 'max:100'],
            'preset_data' => ['required', 'array'],
            'thumbnail' => ['nullable', 'string', 'max:500'],
            'is_global' => ['boolean'],
            'category' => ['nullable', 'string', 'max:100'],
        ];
    }
}
