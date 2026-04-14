<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Cms;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSectionTemplateRequest extends FormRequest
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
            'description' => ['nullable', 'string', 'max:1000'],
            'category' => ['required', 'string', 'in:custom,landing,product,blog,portfolio,other'],
            'is_global' => ['boolean'],
            'snapshot' => ['required', 'array'],
        ];
    }
}
