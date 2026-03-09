<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Ecommerce;

use Illuminate\Foundation\Http\FormRequest;

class StoreShippingMethodRequest extends FormRequest
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
        return [
            'carrier' => 'required|string',
            'name' => 'required|string|max:255',
            'is_active' => 'boolean',
            'min_weight' => 'nullable|numeric|min:0',
            'max_weight' => 'nullable|numeric|min:0',
            'min_order_value' => 'nullable|integer|min:0',
            'free_shipping_threshold' => 'nullable|integer|min:0',
            'base_price' => 'required|integer|min:0',
            'price_per_kg' => 'required|integer|min:0',
        ];
    }
}
