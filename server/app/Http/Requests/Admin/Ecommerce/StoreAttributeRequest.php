<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Ecommerce;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreAttributeRequest extends FormRequest
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
            'slug' => ['required', 'string', 'max:255', 'unique:attributes,slug'],
            'type' => ['required', 'string', 'in:text,number,select,color,boolean,date'],
            'unit' => ['nullable', 'string', 'max:50'],
            'is_filterable' => ['boolean'],
            'is_variant_selection' => ['boolean'],
            'position' => ['nullable', 'integer'],
            'values' => ['nullable', 'array'],
            'values.*.value' => ['required_with:values', 'string', 'max:255'],
            'values.*.label' => ['nullable', 'string', 'max:255'],
            'values.*.color_code' => ['nullable', 'string', 'max:50'],
            'values.*.position' => ['nullable', 'integer'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (empty($this->slug)) {
            $this->merge(['slug' => Str::slug($this->name ?? '')]);
        }
    }
}
