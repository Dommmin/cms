<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Ecommerce;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDiscountRequest extends FormRequest
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
        $discount = $this->route('discount');

        return [
            'code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('discounts', 'code')->ignore($discount?->id),
            ],
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
        ];
    }
}
