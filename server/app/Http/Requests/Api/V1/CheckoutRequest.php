<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1;

use App\Concerns\AddressValidationRules;
use App\Enums\PaymentProviderEnum;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class CheckoutRequest extends FormRequest
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
        $addressRules = $this->addressRules(phoneRequired: true, countryCodeRequired: true);

        return [
            'guest_email' => ['nullable', 'email', 'max:255'],
            'shipping_method_id' => ['required', 'integer', 'exists:shipping_methods,id'],
            'payment_provider' => ['required', 'string', new Enum(PaymentProviderEnum::class)],
            'payment_method' => ['nullable', 'string', Rule::in(['blik', 'card', 'apple_pay', 'google_pay', 'bank_transfer', 'paynow', 'paypo'])],
            'blik_code' => ['nullable', 'string', 'size:6', 'regex:/^\d{6}$/'],
            'payment_token' => ['nullable', 'string', 'max:10000'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'pickup_point_id' => ['nullable', 'string'],
            'referral_code' => ['nullable', 'string', 'max:50'],
            'ga_client_id' => ['nullable', 'string', 'max:255'],
            'terms_accepted' => ['required', 'accepted'],
            'billing_address' => ['required', 'array'],
            ...collect($addressRules)->mapWithKeys(fn ($rules, $key): array => ['billing_address.'.$key => $rules])->all(),
            'shipping_address' => ['required', 'array'],
            ...collect($addressRules)->mapWithKeys(fn ($rules, $key): array => ['shipping_address.'.$key => $rules])->all(),
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v): void {
            if (! $this->user('sanctum') && ! $this->input('guest_email')) {
                $v->errors()->add('guest_email', 'Email is required for guest checkout.');
            }
        });
    }
}
