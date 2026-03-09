<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Ecommerce;

use Illuminate\Foundation\Http\FormRequest;

class StorePromotionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:promotions,slug'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'in:percentage,fixed_amount,buy_x_get_y,free_shipping'],
            'value' => ['required_unless:type,free_shipping', 'numeric', 'min:0'],
            'min_value' => ['nullable', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'apply_to' => ['required', 'in:all,specific_products,specific_categories'],
            'is_active' => ['boolean'],
            'is_stackable' => ['boolean'],
            'priority' => ['integer', 'min:0'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'metadata' => ['nullable', 'array'],
            'products' => ['nullable', 'array'],
            'products.*.discount_value' => ['nullable', 'numeric', 'min:0'],
            'products.*.discount_type' => ['nullable', 'in:percentage,fixed_amount'],
            'categories' => ['nullable', 'array'],
            'categories.*.discount_value' => ['nullable', 'numeric', 'min:0'],
            'categories.*.discount_type' => ['nullable', 'in:percentage,fixed_amount'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nazwa promocji jest wymagana.',
            'slug.required' => 'Slug jest wymagany.',
            'slug.unique' => 'Slug musi być unikalny.',
            'type.required' => 'Typ promocji jest wymagany.',
            'value.required_unless' => 'Wartość promocji jest wymagana (z wyjątkiem darmowej dostawy).',
            'apply_to.required' => 'Zastosowanie promocji jest wymagane.',
            'ends_at.after_or_equal' => 'Data zakończenia musi być późniejsza lub równa dacie rozpoczęcia.',
        ];
    }
}
