<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Ecommerce;

use Illuminate\Foundation\Http\FormRequest;

class UpdateShippingMethodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'carrier' => ['required', 'string'],
            'name' => ['required', 'array'],
            'name.*' => ['nullable', 'string', 'max:255'],
            'name.en' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'array'],
            'description.*' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['boolean'],
            'min_weight' => ['nullable', 'numeric', 'min:0'],
            'max_weight' => ['nullable', 'numeric', 'min:0'],
            'min_order_value' => ['nullable', 'integer', 'min:0'],
            'free_shipping_threshold' => ['nullable', 'integer', 'min:0'],
            'base_price' => ['required', 'integer', 'min:0'],
            'price_per_kg' => ['required', 'integer', 'min:0'],
            'estimated_days_min' => ['nullable', 'integer', 'min:0', 'max:365'],
            'estimated_days_max' => ['nullable', 'integer', 'min:0', 'max:365', 'gte:estimated_days_min'],
            'max_length_cm' => ['nullable', 'integer', 'min:1', 'max:9999'],
            'max_width_cm' => ['nullable', 'integer', 'min:1', 'max:9999'],
            'max_depth_cm' => ['nullable', 'integer', 'min:1', 'max:9999'],
            'requires_signature' => ['boolean'],
            'insurance_available' => ['boolean'],
        ];
    }
}
