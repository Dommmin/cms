<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMenuRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'location' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
            'items' => ['sometimes', 'array'],
            'items.*.label' => ['required', 'array'],
            'items.*.label.*' => ['required', 'string', 'max:255'],
            'items.*.url' => ['nullable', 'string', 'max:500'],
            'items.*.target' => ['nullable', 'string', 'in:_self,_blank'],
            'items.*.icon' => ['nullable', 'string', 'max:100'],
            'items.*.children' => ['sometimes', 'array'],
            'items.*.children.*.label' => ['required', 'array'],
            'items.*.children.*.label.*' => ['required', 'string', 'max:255'],
            'items.*.children.*.url' => ['nullable', 'string', 'max:500'],
            'items.*.children.*.target' => ['nullable', 'string', 'in:_self,_blank'],
            'items.*.children.*.icon' => ['nullable', 'string', 'max:100'],
        ];
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    protected function prepareForValidation(): void
    {
        if ($this->input('location') === 'none') {
            $this->merge(['location' => null]);
        }
    }
}
