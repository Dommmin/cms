<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Ecommerce;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class UpdateProductTypeRequest extends FormRequest
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
        $productType = $this->route('product_type') ?? $this->route('productType');

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:product_types,slug,'.$productType?->id],
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
