<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Ecommerce;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTaxRateRequest extends FormRequest
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
            'rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'is_active' => ['boolean'],
            'is_default' => ['boolean'],
        ];
    }
}
