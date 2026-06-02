<?php

declare(strict_types=1);

namespace App\Http\Requests\Admin\Ecommerce;

use App\Concerns\AddressValidationRules;
use App\Models\Customer;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAddressRequest extends FormRequest
{
    use AddressValidationRules;

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
            'customer_id' => ['required', 'exists:customers,id'],
            'type' => ['required', 'string', 'in:billing,shipping'],
            ...$this->addressRules(phoneRequired: false, countryCodeRequired: true),
            'is_default' => ['boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->route('customer')) {
            $this->merge([
                'customer_id' => $this->route('customer') instanceof Customer
                    ? $this->route('customer')->id
                    : $this->route('customer'),
            ]);
        }
    }
}
