<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Ecommerce;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerSegmentRequest extends FormRequest
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
            'description' => ['nullable', 'string'],
            'type' => ['required', 'string', 'in:manual,dynamic'],
            'is_active' => ['sometimes', 'boolean'],
            'rules' => ['nullable', 'array'],
            'rules.*.field' => ['required_with:rules', 'string', 'in:total_spent,order_count,average_order_value,last_order_date,customer_age_days,has_tag'],
            'rules.*.operator' => ['required_with:rules', 'string', 'in:>,<,=,>=,<='],
            'rules.*.value' => ['required_with:rules', 'string'],
        ];
    }
}
