<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Ecommerce;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreProductTypeRequest extends FormRequest
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
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:product_types,slug'],
            'has_variants' => ['boolean'],
            'is_shippable' => ['boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'has_variants' => $this->boolean('has_variants'),
            'is_shippable' => $this->boolean('is_shippable', true),
            'slug' => empty($this->slug) ? Str::slug($this->name ?? '') : $this->slug,
        ]);
    }
}
