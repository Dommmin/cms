<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCurrencyRequest extends FormRequest
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
        $currency = $this->route('currency');

        return [
            'code' => ['required', 'string', 'size:3', 'unique:currencies,code,'.$currency?->id],
            'name' => ['required', 'string', 'max:255'],
            'symbol' => ['required', 'string', 'max:10'],
            'decimal_places' => ['required', 'integer', 'min:0', 'max:4'],
            'is_active' => ['sometimes', 'boolean'],
            'is_base' => ['sometimes', 'boolean'],
        ];
    }
}
