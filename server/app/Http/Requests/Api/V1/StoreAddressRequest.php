<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use App\Concerns\AddressValidationRules;
use App\Enums\AddressTypeEnum;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreAddressRequest extends FormRequest
{
    use AddressValidationRules;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', 'string', new Enum(AddressTypeEnum::class)],
            ...$this->addressRules(phoneRequired: false, countryCodeRequired: true),
            'is_default' => ['sometimes', 'boolean'],
        ];
    }
}
