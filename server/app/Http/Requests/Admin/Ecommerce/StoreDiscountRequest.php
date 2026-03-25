<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Ecommerce;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreDiscountRequest extends FormRequest
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
            'code' => ['required', 'string', 'max:255', 'unique:discounts,code'],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:percentage,fixed_amount,free_shipping'],
            'value' => ['required', 'integer', 'min:0'],
            'apply_to' => ['required', 'string', 'in:order,product,category,shipping'],
            'min_order_value' => ['nullable', 'integer', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'max_uses_per_customer' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'is_active' => ['sometimes', 'boolean'],
            'conditions' => ['nullable', 'array'],
            'conditions.*.type' => ['required_with:conditions', 'string', 'in:category,product,min_quantity,customer_group'],
            'conditions.*.operator' => ['required_with:conditions', 'string', 'in:equals,not_equals,greater_than,less_than,in,not_in'],
            'conditions.*.value' => ['required_with:conditions', 'string'],
        ];
    }
}
