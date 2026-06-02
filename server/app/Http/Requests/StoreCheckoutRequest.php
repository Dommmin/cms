<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Concerns\AddressValidationRules;
use App\Enums\PaymentProviderEnum;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

/**
 * @property int $shipping_method_id
 * @property string $payment_provider
 * @property array<string, mixed> $billing_address
 * @property array<string, mixed> $shipping_address
 * @property string|null $pickup_point_id
 * @property string|null $notes
 */
class StoreCheckoutRequest extends FormRequest
{
    use AddressValidationRules;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, Enum|\Illuminate\Contracts\Validation\Rule|ValidationRule|string>>
     */
    public function rules(): array
    {
        $addressRules = $this->addressRules(phoneRequired: true, countryCodeRequired: false);

        return [
            'shipping_method_id' => ['required', 'integer', 'exists:shipping_methods,id'],
            'payment_provider' => ['required', 'string', Rule::enum(PaymentProviderEnum::class)],
            'pickup_point_id' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:2000'],

            'billing_address' => ['required', 'array'],
            ...collect($addressRules)->mapWithKeys(fn ($rules, $key): array => ['billing_address.'.$key => $rules])->all(),
            'shipping_address' => ['required', 'array'],
            ...collect($addressRules)->mapWithKeys(fn ($rules, $key): array => ['shipping_address.'.$key => $rules])->all(),
        ];
    }
}
