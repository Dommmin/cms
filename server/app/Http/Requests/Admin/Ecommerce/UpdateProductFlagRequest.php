<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Ecommerce;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class UpdateProductFlagRequest extends FormRequest
{
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
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:product_flags,slug,'.$this->productFlag->id,
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'position' => 'nullable|integer|min:0',
        ];
    }

    protected function prepareForValidation(): void
    {
        if (empty($this->slug)) {
            $this->merge(['slug' => Str::slug($this->name ?? '')]);
        }
    }
}
