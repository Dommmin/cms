<?php

declare(strict_types=1);

namespace App\Concerns;

use Illuminate\Contracts\Validation\ValidationRule;

trait AddressValidationRules
{
    /**
     * Get the validation rules used to validate address data.
     *
     * @return array<string, array<int, ValidationRule|string>>
     */
    protected function addressRules(bool $phoneRequired = true, bool $countryCodeRequired = true): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'street' => ['required', 'string', 'max:255'],
            'street2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:20'],
            'country_code' => [$countryCodeRequired ? 'required' : 'nullable', 'string', 'size:2'],
            'phone' => [$phoneRequired ? 'required' : 'nullable', 'string', 'max:30'],
        ];
    }
}
